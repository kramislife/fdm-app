"use client";

import { logoutAction } from "@/app/(auth)/logout/actions";

export function useSignOut() {
  return async function handleSignOut() {
    await logoutAction();
    window.location.href = "/";
  };
}
