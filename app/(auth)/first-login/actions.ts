"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export type SetPasswordState = {
  error: string | null;
};

export async function setPasswordAction(
  _prevState: SetPasswordState,
  formData: FormData,
): Promise<SetPasswordState> {
  const newPassword = formData.get("new_password") as string;
  const confirmPassword = formData.get("confirm_password") as string;

  if (!newPassword || newPassword.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  if (newPassword !== confirmPassword) {
    return { error: "Passwords do not match." };
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
    return { error: "Failed to update password. Please try again." };
  }

  const dbUser = await prisma.user.findUnique({
    where: { auth_id: user.id },
  });

  if (!dbUser) {
    return { error: "User profile not found. Please contact an administrator." };
  }

  await prisma.user.update({
    where: { id: dbUser.id },
    data: {
      auth_id: user.id,
      status: "registered",
      is_temp_password: false,
      account_expires_at: null,
      member_qr: crypto.randomUUID(),
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
    const attendanceIds = unlinkedGuestLogs.map((gl: { id: number; attendance_id: number }) => gl.attendance_id);
    const guestLogIds = unlinkedGuestLogs.map((gl: { id: number; attendance_id: number }) => gl.id);

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

  redirect("/dashboard");
}
