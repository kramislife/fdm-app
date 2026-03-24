"use server";

import { revalidatePath } from "next/cache";
import { signOut } from "@/lib/auth/config";

export async function logoutAction() {
  await signOut();
  revalidatePath("/", "layout");
  return { success: true };
}
