import { NextResponse, type NextRequest } from "next/server";
import crypto from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { backfillAttendance } from "@/lib/auth";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { normalizeEmail, isValidEmailFormat } from "@/lib/format";
import { splitName } from "@/lib/format";
import { AUTH_ERROR_CODES, buildLoginErrorPath } from "@/lib/auth-errors";
import { ROLE_KEYS } from "@/lib/app-roles";
import { ACCOUNT_STATUS } from "@/lib/status";

// Upload user avatar to Cloudinary
async function uploadAvatar(imageUrl: string, userId: number) {
  return uploadToCloudinary(imageUrl, {
    folder: "fdm/avatars",
    publicId: String(userId),
  });
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(
      `${origin}${buildLoginErrorPath(AUTH_ERROR_CODES.AUTH_FAILED)}`,
    );
  }

  const supabase = await createClient();

  const { error: exchangeError } =
    await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    return NextResponse.redirect(
      `${origin}${buildLoginErrorPath(AUTH_ERROR_CODES.AUTH_FAILED)}`,
    );
  }

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  const isGoogleProvider =
    authUser?.app_metadata?.provider === "google" ||
    authUser?.identities?.some((identity) => identity.provider === "google");

  if (!authUser || !isGoogleProvider) {
    await supabase.auth.signOut();
    return NextResponse.redirect(
      `${origin}${buildLoginErrorPath(AUTH_ERROR_CODES.AUTH_FAILED)}`,
    );
  }

  const email = normalizeEmail(authUser.email);
  const googleIdentity = authUser.identities?.find(
    (identity) => identity.provider === "google",
  );
  const emailVerifiedByProvider =
    authUser.email_confirmed_at !== null ||
    googleIdentity?.identity_data?.email_verified === true;

  if (!email || !isValidEmailFormat(email) || !emailVerifiedByProvider) {
    await supabase.auth.signOut();
    return NextResponse.redirect(
      `${origin}${buildLoginErrorPath(AUTH_ERROR_CODES.INVALID_GOOGLE_EMAIL)}`,
    );
  }

  const identityData = googleIdentity?.identity_data;
  const avatarUrl: string | undefined =
    authUser.user_metadata?.avatar_url ??
    authUser.user_metadata?.picture ??
    identityData?.avatar_url ??
    identityData?.picture;

  // Look up existing public.users row by email
  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      auth_id: true,
      is_temp_password: true,
      photo_url: true,
      created_at: true,
      user_roles: {
        where: { is_active: true },
        include: { role: true },
        take: 1,
      },
    },
  });

  // ─── Case 1: Admin-provisioned — do not allow Google sign-in ───
  if (existingUser?.is_temp_password) {
    await supabase.auth.signOut();
    const dateParam = existingUser.created_at.toISOString();
    return NextResponse.redirect(
      `${origin}${buildLoginErrorPath(AUTH_ERROR_CODES.PROVISIONED, { date: dateParam })}`,
    );
  }

  // ─── Case 2: Existing registered user ───
  if (existingUser) {
    const updates: { auth_id?: string; photo_url?: string } = {};

    if (!existingUser.auth_id) updates.auth_id = authUser.id;

    // Save Google photo if user has none yet
    if (!existingUser.photo_url && avatarUrl) {
      const photoUrl = await uploadAvatar(avatarUrl, existingUser.id);
      console.log("[auth/callback] case 2 photo upload result:", photoUrl);
      if (photoUrl) updates.photo_url = photoUrl;
    }

    if (Object.keys(updates).length > 0) {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: updates,
      });
    }

    await backfillAttendance(email, existingUser.id);

    const role = existingUser.user_roles[0]?.role?.key ?? ROLE_KEYS.MEMBER;
    return NextResponse.redirect(
      `${origin}${role === ROLE_KEYS.MEMBER ? "/" : "/dashboard"}`,
    );
  }

  // ─── Case 3: New Gmail user ───
  const fullName: string =
    authUser.user_metadata?.full_name ??
    authUser.user_metadata?.name ??
    email.split("@")[0];

  const { first_name: firstName, last_name: lastName } = splitName(fullName);

  // Look up director adviser as system actor for assigned_by
  const daUser = await prisma.user.findFirst({
    where: {
      user_roles: {
        some: {
          role: { key: ROLE_KEYS.DIRECTOR_ADVISER },
          is_active: true,
        },
      },
    },
    select: { id: true },
  });

  const memberRole = await prisma.role.findUnique({
    where: { key: ROLE_KEYS.MEMBER },
    select: { id: true },
  });

  if (!daUser || !memberRole) {
    return NextResponse.redirect(
      `${origin}${buildLoginErrorPath(AUTH_ERROR_CODES.AUTH_FAILED)}`,
    );
  }

  // Create the new user row first (need ID for Cloudinary folder)
  const newUser = await prisma.user.create({
    data: {
      first_name: firstName,
      last_name: lastName,
      email,
      auth_id: authUser.id,
      account_status: ACCOUNT_STATUS.VERIFIED,
      is_temp_password: false,
      is_qr_only: false,
      member_qr: crypto.randomUUID(),
      qr_generated_at: new Date(),
    },
  });

  // Upload Google avatar to Cloudinary (non-blocking on failure)
  let photoUrl: string | null = null;
  if (avatarUrl) {
    photoUrl = await uploadAvatar(avatarUrl, newUser.id);
    console.log("[auth/callback] case 3 photo upload result:", photoUrl);
  }

  if (photoUrl) {
    await prisma.user.update({
      where: { id: newUser.id },
      data: { photo_url: photoUrl },
    });
  }

  // Assign member role
  await prisma.userRole.create({
    data: {
      user_id: newUser.id,
      role_id: memberRole.id,
      assigned_by: daUser.id,
      is_active: true,
    },
  });

  await backfillAttendance(email, newUser.id);

  return NextResponse.redirect(`${origin}/`);
}
