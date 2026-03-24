"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/prisma";
import { ACCOUNT_STATUS } from "@/lib/constants/status";
import crypto from "node:crypto";

export type FirstLoginResult =
  | { success: true }
  | { success: false; error: string };

export async function completeFirstLogin(
  newPassword: string,
): Promise<FirstLoginResult> {
  if (!newPassword || newPassword.length < 8) {
    return { success: false, error: "Password does not meet requirements." };
  }
  if (!/[A-Z]/.test(newPassword)) {
    return { success: false, error: "Password does not meet requirements." };
  }
  if (!/[0-9]/.test(newPassword)) {
    return { success: false, error: "Password does not meet requirements." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated." };
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError) {
    return {
      success: false,
      error: updateError.message || "Failed to update password.",
    };
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { auth_id: user.id },
    });

    if (!dbUser) {
      return { success: false, error: "User profile not found." };
    }

    if (!dbUser.email) {
      return { success: false, error: "User profile email is missing." };
    }

    const now = new Date();
    const memberQr = dbUser.member_qr ?? crypto.randomUUID();

    await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        auth_id: user.id,
        account_status: ACCOUNT_STATUS.VERIFIED,
        is_temp_password: false,
        member_qr: memberQr,
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
      const attendanceIds = unlinkedGuestLogs.map((gl) => gl.attendance_id);
      const guestLogIds = unlinkedGuestLogs.map((gl) => gl.id);

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

    return { success: true };
  } catch (error) {
    console.error("First login data update error:", error);
    return {
      success: false,
      error: "Failed to finalize account setup. Please try again.",
    };
  }
}
