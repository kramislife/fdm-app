"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/prisma";
import { ACCOUNT_STATUS } from "@/lib/constants/status";
import crypto from "node:crypto";

export type SetPasswordState = {
  error: string | null;
  errorId?: number;
};

function err(message: string): SetPasswordState {
  return { error: message, errorId: Date.now() };
}

export async function setPasswordAction(
  _prevState: SetPasswordState,
  formData: FormData,
): Promise<SetPasswordState> {
  const newPassword = formData.get("new_password") as string;
  const confirmPassword = formData.get("confirm_password") as string;

  if (!newPassword || newPassword.length < 8) {
    return err("Password must be at least 8 characters.");
  }

  if (newPassword !== confirmPassword) {
    return err("Passwords do not match.");
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError) {
    console.error("Supabase password update error:", updateError);
    return err(updateError.message || "Failed to update password. Please try again.");
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { auth_id: user.id },
    });

    if (!dbUser) {
      console.error("User profile not found for auth_id:", user.id);
      return err("User profile not found. Please contact an administrator.");
    }

    if (!dbUser.email) {
      console.error("User profile has no email for auth_id:", user.id);
      return err("User profile email is missing. Please contact an administrator.");
    }

    const now = new Date();
    await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        auth_id: user.id,
        account_status: ACCOUNT_STATUS.VERIFIED,
        is_temp_password: false,
        // Auto-generate QR on first login if not already set (QR-only converted users keep theirs)
        member_qr: dbUser.member_qr ?? crypto.randomUUID(),
        qr_generated_at: dbUser.member_qr ? undefined : now,
      },
    });

    // Backfill attendance: link guest logs by email
    const unlinkedGuestLogs = await prisma.guestLog.findMany({
      where: {
        email: dbUser.email,
        linked_user_id: null,
      },
      select: { id: true, attendance_id: true },
    });

    if (unlinkedGuestLogs.length > 0) {
      const attendanceIds = unlinkedGuestLogs.map(
        (gl: { id: number; attendance_id: number }) => gl.attendance_id,
      );
      const guestLogIds = unlinkedGuestLogs.map(
        (gl: { id: number; attendance_id: number }) => gl.id,
      );

      await prisma.$transaction([
        prisma.attendance.updateMany({
          where: { id: { in: attendanceIds }, user_id: null },
          data: { user_id: dbUser.id },
        }),
        prisma.guestLog.updateMany({
          where: { id: { in: guestLogIds } },
          data: { linked_user_id: dbUser.id },
        }),
      ]);
    }

    // Check active roles to determine redirect target
    const activeRoles = await prisma.userRole.count({
      where: { user_id: dbUser.id, is_active: true },
    });

    redirect(activeRoles > 0 ? "/dashboard" : "/");
  } catch (error) {
    console.error("First login data update error:", error);
    return err("Failed to finalize account setup. Please try again.");
  }

  // Fallback (redirect in try block handles normal flow)
  redirect("/");
}
