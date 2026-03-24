"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/roles";
import { ROLE_KEYS } from "@/lib/constants/app-roles";
import { AUTH_ERROR_CODES, buildLoginErrorPath } from "@/lib/auth/errors";

// Initiates the Google OAuth flow on the server.
export async function signInWithGoogle() {
  const origin = (await headers()).get("origin");
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
      scopes: "openid email profile",
      queryParams: {
        prompt: "consent",
        access_type: "offline",
      },
    },
  });

  if (error) {
    console.error("Google sign-in error:", error);
    return redirect(buildLoginErrorPath(AUTH_ERROR_CODES.AUTH_FAILED));
  }

  if (data.url) {
    return redirect(data.url);
  }
}

export type LoginState = {
  error: string | null;
  errorId?: number;
};

function err(message: string): LoginState {
  return { error: message, errorId: Date.now() };
}

export async function loginAction(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return err("Email and password are required.");
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return err("Invalid email or password. Please try again.");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return err("Authentication failed. Please try again.");
  }

  // Check for temp password before role lookup
  const { prisma } = await import("@/lib/db/prisma");
  let dbUser;
  try {
    dbUser = await prisma.user.findUnique({
      where: { auth_id: user.id },
      select: { is_temp_password: true },
    });
  } catch (e) {
    console.error("Database connection error during login:", e);
    await supabase.auth.signOut();
    return err("Unable to verify your account at this time. Please try again later.");
  }

  if (!dbUser) {
    await supabase.auth.signOut();
    return err("Your account exists but is not linked to a community profile. Please contact an admin.");
  }

  if (dbUser.is_temp_password) redirect("/");

  // Resolve role from DB
  const role = await getUserRole(user.id);

  if (!role || role === ROLE_KEYS.MEMBER) redirect("/");

  redirect("/dashboard");
}
