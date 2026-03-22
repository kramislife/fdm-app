"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { ROLE_KEYS } from "@/lib/app-roles";
import crypto from "node:crypto";

export type QRActionResult = {
  success: boolean;
  title?: string;
  description?: string;
};

export async function regenerateMyQR(): Promise<QRActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, title: "Unauthorized" };

  const dbUser = await prisma.user.findUnique({
    where: { auth_id: user.id },
    select: {
      id: true,
      qr_generated_at: true,
      user_roles: {
        where: { is_active: true },
        select: { role: { select: { key: true } } },
      },
    },
  });

  if (!dbUser) return { success: false, title: "User not found" };

  const roleKeys = dbUser.user_roles.map((ur) => ur.role.key);
  const isBypassed =
    roleKeys.includes(ROLE_KEYS.DIRECTOR_ADVISER) ||
    roleKeys.includes(ROLE_KEYS.ELDER) ||
    roleKeys.includes(ROLE_KEYS.HEAD_SERVANT);

  if (!isBypassed && dbUser.qr_generated_at) {
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
    const now = new Date();
    const cooldownEnd = dbUser.qr_generated_at.getTime() + sevenDaysInMs;

    if (now.getTime() < cooldownEnd) {
      const remainingDays = Math.ceil(
        (cooldownEnd - now.getTime()) / (24 * 60 * 60 * 1000),
      );
      return {
        success: false,
        title: "Generation Cooldown",
        description: `QR Code was recently generated on ${dbUser.qr_generated_at.toLocaleDateString()}. You can regenerate again after ${new Date(cooldownEnd).toLocaleDateString()} (${remainingDays} ${remainingDays === 1 ? "day" : "days"} remaining).`,
      };
    }
  }

  await prisma.user.update({
    where: { id: dbUser.id },
    data: {
      member_qr: crypto.randomUUID(),
      qr_generated_at: new Date(),
      qr_regenerated_count: { increment: 1 },
    },
  });

  return {
    success: true,
    title: "QR Code Regenerated",
    description: "Your new QR code has been generated successfully.",
  };
}
