"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/roles";

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
    return err("Invalid email or password.");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return err("Authentication failed. Please try again.");
  }

  // Check for temp password before role lookup
  const { prisma } = await import("@/lib/prisma");
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

  if (dbUser.is_temp_password) redirect("/first-login");

  // Resolve role from DB
  const role = await getUserRole(user.id);

  if (!role || role === "member") redirect("/");

  redirect("/dashboard");
}
