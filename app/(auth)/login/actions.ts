"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getUserWithRoles,
  getRoleKeys,
  isMemberOnly,
} from "@/lib/auth/session";

export type LoginState = {
  error: string | null;
};

export async function loginAction(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Invalid email or password." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Authentication failed. Please try again." };
  }

  let dbUser;
  try {
    dbUser = await getUserWithRoles(user.id);
  } catch (err) {
    console.error("Database connection error during login:", err);
    await supabase.auth.signOut();
    return {
      error:
        "Unable to verify your account at this time. Please try again later.",
    };
  }

  if (!dbUser) {
    await supabase.auth.signOut();
    return {
      error:
        "Your account exists but is not linked to a community profile. Please contact an admin.",
    };
  }

  if (dbUser.is_temp_password) redirect("/first-login");

  if (isMemberOnly(getRoleKeys(dbUser))) redirect("/");

  redirect("/dashboard");
}
