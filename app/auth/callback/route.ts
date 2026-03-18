import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { backfillAttendance } from "@/lib/auth";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { USER_STATUS } from "@/lib/status";

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
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
  }

  const supabase = await createClient();

  const { error: exchangeError } =
    await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
  }

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser?.email) {
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
  }

  const email = authUser.email;
  const identityData = authUser.identities?.[0]?.identity_data;
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
      `${origin}/login?error=provisioned&date=${encodeURIComponent(dateParam)}`,
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

    const role = existingUser.user_roles[0]?.role?.key ?? "member";
    return NextResponse.redirect(
      `${origin}${role === "member" ? "/" : "/dashboard"}`,
    );
  }

  // ─── Case 3: New Gmail user ───
  const fullName: string =
    authUser.user_metadata?.full_name ??
    authUser.user_metadata?.name ??
    email.split("@")[0];

  const nameParts = fullName.trim().split(/\s+/);
  const firstName = nameParts[0] ?? "Unknown";
  const lastName = nameParts.slice(1).join(" ") || "—";

  // Look up spiritual director as system actor for assigned_by
  const sdUser = await prisma.user.findFirst({
    where: {
      user_roles: {
        some: { role: { key: "spiritual_director" }, is_active: true },
      },
    },
    select: { id: true },
  });

  const memberRole = await prisma.role.findUnique({
    where: { key: "member" },
    select: { id: true },
  });

  if (!sdUser || !memberRole) {
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
  }

  // Create the new user row first (need ID for Cloudinary folder)
  const newUser = await prisma.user.create({
    data: {
      first_name: firstName,
      last_name: lastName,
      email,
      auth_id: authUser.id,
      status: USER_STATUS.REGISTERED,
      is_temp_password: false,
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
      assigned_by: sdUser.id,
      is_active: true,
    },
  });

  await backfillAttendance(email, newUser.id);

  return NextResponse.redirect(`${origin}/`);
}
