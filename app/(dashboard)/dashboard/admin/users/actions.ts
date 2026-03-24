"use server";

import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth";
import { PERMISSION_ROLES, ROLE_KEYS } from "@/lib/app-roles";
import { ACCOUNT_STATUS } from "@/lib/status";
import { revalidatePath } from "next/cache";
import crypto from "node:crypto";
import { isValidEmailFormat, isValidPhoneNumber } from "@/lib/format";

export type UserFormData = {
  first_name: string;
  last_name: string;
  contact_number: string;
  email: string;
  birthday: string;
  account_status: string;
  address: string;
  chapter_id?: number;
  is_qr_only: boolean;
};

export type ActionResult = {
  success: boolean;
  title?: string;
  description?: string;
  errors?: Record<string, string>;
  warning?: string;
  member_qr?: string;
};

function generateTempPassword() {
  return crypto.randomBytes(6).toString("hex").toUpperCase();
}

function validateUser(data: UserFormData): ActionResult | null {
  const errors: Record<string, string> = {};
  if (!data.first_name?.trim()) errors.first_name = "First name is required.";
  if (!data.last_name?.trim()) errors.last_name = "Last name is required.";

  if (!data.is_qr_only) {
    if (!data.email?.trim()) {
      errors.email = "Email is required.";
    } else if (!isValidEmailFormat(data.email)) {
      errors.email = "Invalid email format.";
    }
  }

  if (
    data.contact_number &&
    data.contact_number.trim() &&
    !isValidPhoneNumber(data.contact_number)
  ) {
    errors.contact_number =
      "Must be a valid PH mobile number (e.g. 09123456789).";
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      title: "Form Incomplete",
      description: "Please check the highlighted fields and try again.",
      errors,
    };
  }
  return null;
}

// ─── Create User ───────────────────────────────────────────────────────────────

export async function createUser(data: UserFormData): Promise<ActionResult> {
  const actor = await requireRole([...PERMISSION_ROLES.USERS_VIEW]);
  const actorId = actor.user.id;

  const validationError = validateUser(data);
  if (validationError) return validationError;

  try {
    // ── TYPE 2: QR-Only Member ─────────────────────────────────────────────
    if (data.is_qr_only) {
      const memberQr = crypto.randomUUID();

      await prisma.user.create({
        data: {
          first_name: data.first_name,
          last_name: data.last_name,
          email: null,
          contact_number: null,
          birthday: data.birthday ? new Date(data.birthday) : null,
          address: data.address,
          account_status: ACCOUNT_STATUS.PENDING,
          is_qr_only: true,
          is_temp_password: false,
          member_qr: memberQr,
          qr_generated_at: new Date(),
          auth_id: null,
          created_by: actorId,
          user_chapters:
            data.chapter_id != null
              ? { create: { chapter_id: data.chapter_id, is_primary: true } }
              : undefined,
          user_roles: {
            create: {
              role: { connect: { key: ROLE_KEYS.MEMBER } },
              assigner: { connect: { id: actorId } },
              is_active: true,
            },
          },
          activation_email_resent: 0,
        },
      });

      revalidatePath("/dashboard/admin/users");
      return {
        success: true,
        title: "QR Member Created",
        description: "QR code generated. Print it and hand it to the member.",
        member_qr: memberQr,
      };
    }

    // ── TYPE 1: Normal Member ──────────────────────────────────────────────
    const email = data.email?.trim() || null;

    if (!email) {
      return {
        success: false,
        errors: { email: "Email is required for normal members." },
      };
    }

    // 1. Validate email uniqueness
    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existing) {
      return {
        success: false,
        title: "Email already registered",
        description: "Try logging in or use a different email instead.",
        errors: { email: "Email already exists in the system." },
      };
    }

    const tempPassword = generateTempPassword();

    // 2. Create Supabase Auth account
    const supabaseAdmin = createAdminClient();
    const { data: authResult, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
      });

    if (authError) {
      console.error("[createUser] auth error:", authError);
      return {
        success: false,
        title: "Auth Creation Failed",
        description: authError.message,
      };
    }

    const authId = authResult.user.id;

    // 3. Create public.users row
    await prisma.user.create({
      data: {
        first_name: data.first_name,
        last_name: data.last_name,
        email,
        contact_number: data.contact_number || null,
        birthday: data.birthday ? new Date(data.birthday) : null,
        address: data.address,
        account_status: ACCOUNT_STATUS.PENDING,
        is_qr_only: false,
        is_temp_password: true,
        member_qr: null,
        auth_id: authId,
        created_by: actorId,
        activation_email_resent: 0,
        user_chapters:
          data.chapter_id != null
            ? { create: { chapter_id: data.chapter_id, is_primary: true } }
            : undefined,
        user_roles: {
          create: {
            role: { connect: { key: ROLE_KEYS.MEMBER } },
            assigner: { connect: { id: actorId } },
            is_active: true,
          },
        },
      },
    });

    revalidatePath("/dashboard/admin/users");
    return {
      success: true,
      title: "User Created",
      description:
        "Account created. Temporary credentials has been sent to the registered email address.",
    };
  } catch (error: any) {
    console.error("[createUser] error:", error);
    return {
      success: false,
      title: "Error",
      description: error.message || "An unexpected error occurred.",
    };
  }
}

// ─── Update User ───────────────────────────────────────────────────────────────

export async function updateUser(
  id: number,
  data: UserFormData,
): Promise<ActionResult> {
  const actor = await requireRole([...PERMISSION_ROLES.USERS_VIEW]);
  const actorId = actor.user.id;

  const validationError = validateUser(data);
  if (validationError) return validationError;

  try {
    const existing = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        first_name: true,
        email: true,
        account_status: true,
        auth_id: true,
        is_qr_only: true,
        user_chapters: {
          where: { is_primary: true },
          select: { chapter_id: true, chapter: { select: { name: true } } },
          take: 1,
        },
      },
    });

    if (!existing) {
      return { success: false, description: "User not found." };
    }

    // Block normal → QR-only conversion
    if (data.is_qr_only && !existing.is_qr_only) {
      return {
        success: false,
        description: "Cannot convert a normal account to QR-only.",
      };
    }

    const isConvertingToNormal = existing.is_qr_only && !data.is_qr_only;
    const email = data.email?.trim() || null;
    const isEmailChanged = existing.email !== email;

    // Email edit rules
    if (isEmailChanged) {
      const canEditEmail =
        existing.account_status === ACCOUNT_STATUS.PENDING ||
        isConvertingToNormal;

      if (!canEditEmail) {
        return {
          success: false,
          errors: { email: "Email can only be changed for pending accounts." },
        };
      }

      // Uniqueness check
      if (email) {
        const dupe = await prisma.user.findFirst({
          where: { email, NOT: { id } },
          select: { id: true },
        });
        if (dupe) {
          return {
            success: false,
            title: "Email already registered",
            description: "Try logging in or use a different email.",
            errors: { email: "Email already exists in the system." },
          };
        }
      }

      const supabaseAdmin = createAdminClient();

      if (email) {
        if (existing.auth_id) {
          const { error: authError } =
            await supabaseAdmin.auth.admin.updateUserById(existing.auth_id, {
              email,
            });
          if (authError) {
            return {
              success: false,
              title: "Auth Update Failed",
              description: authError.message,
            };
          }
        } else {
          // No auth yet (QR-only → normal conversion)
          const tempPassword = generateTempPassword();
          const { data: authResult, error: authError } =
            await supabaseAdmin.auth.admin.createUser({
              email,
              password: tempPassword,
              email_confirm: true,
            });

          if (authError) {
            return {
              success: false,
              title: "Auth Creation Failed",
              description: authError.message,
            };
          }

          // Save auth_id + is_qr_only + is_temp_password immediately
          await prisma.user.update({
            where: { id },
            data: {
              auth_id: authResult.user.id,
              is_qr_only: false,
              is_temp_password: true,
            },
          });

          await prisma.user.update({
            where: { id },
            data: {
              first_name: data.first_name,
              last_name: data.last_name,
              contact_number: data.contact_number || null,
              email,
              birthday: data.birthday ? new Date(data.birthday) : null,
              address: data.address,
              updated_by: actorId,
              user_chapters:
                data.chapter_id !== undefined
                  ? {
                      deleteMany: { is_primary: true },
                      ...(data.chapter_id != null && {
                        create: {
                          chapter_id: data.chapter_id,
                          is_primary: true,
                        },
                      }),
                    }
                  : undefined,
            },
          });

          revalidatePath("/dashboard/admin/users");
          return {
            success: true,
            title: "Account Converted",
            description:
              "QR-only account converted. Share credentials with the member manually.",
          };
        }
      } else if (existing.auth_id) {
        // Email removed → delete auth account
        await supabaseAdmin.auth.admin.deleteUser(existing.auth_id);
      }
    }

    // Main update
    await prisma.user.update({
      where: { id },
      data: {
        first_name: data.first_name,
        last_name: data.last_name,
        contact_number: data.contact_number || null,
        email,
        auth_id: email ? undefined : null,
        birthday: data.birthday ? new Date(data.birthday) : null,
        address: data.address,
        updated_by: actorId,
        user_chapters:
          data.chapter_id !== undefined
            ? {
                deleteMany: { is_primary: true },
                ...(data.chapter_id != null && {
                  create: { chapter_id: data.chapter_id, is_primary: true },
                }),
              }
            : undefined,
      },
    });

    revalidatePath("/dashboard/admin/users");

    // Warn if home chapter changed and user has active chapter-scoped roles in old chapter
    const oldChapterId = existing.user_chapters[0]?.chapter_id ?? null;
    const oldChapterName = existing.user_chapters[0]?.chapter?.name ?? null;
    if (data.chapter_id && oldChapterId && data.chapter_id !== oldChapterId) {
      const activeChapterRoles = await prisma.userRole.findMany({
        where: {
          user_id: id,
          is_active: true,
          chapter_id: oldChapterId,
          role: { scope: "chapter" },
        },
        include: { role: { select: { name: true } } },
      });

      if (activeChapterRoles.length > 0) {
        const roleNames = activeChapterRoles
          .map((ur) => ur.role.name)
          .join(", ");
        return {
          success: true,
          title: "User Updated",
          warning: `${existing.first_name} has active roles in ${oldChapterName}: ${roleNames}. Changing home chapter does not affect these roles. Update them via Manage Roles if needed.`,
        };
      }
    }

    return { success: true, title: "User Updated" };
  } catch (error: any) {
    console.error("[updateUser] error:", error);
    return {
      success: false,
      title: "Error",
      description: error.message || "An unexpected error occurred.",
    };
  }
}

// ─── Deactivate User ───────────────────────────────────────────────────────────

export async function deactivateUser(id: number): Promise<ActionResult> {
  const actor = await requireRole([...PERMISSION_ROLES.USERS_VIEW]);
  const actorId = actor.user.id;

  if (id === actorId) {
    return {
      success: false,
      title: "Action Denied",
      description: "You cannot remove your own dashboard access.",
    };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        user_roles: { where: { is_active: true }, include: { role: true } },
      },
    });

    if (!user) return { success: false, description: "User not found." };

    const isDA = user.user_roles.some(
      (ur) => ur.role.key === ROLE_KEYS.DIRECTOR_ADVISER,
    );
    if (isDA) {
      return {
        success: false,
        description: "The Director Adviser account cannot be deactivated.",
      };
    }

    const now = new Date();

    await prisma.$transaction([
      prisma.userRole.updateMany({
        where: { user_id: id, is_active: true },
        data: { is_active: false, deactivated_at: now, access_revoked: true },
      }),
      prisma.user.update({
        where: { id },
        data: { deactivated_at: now, deactivated_by: actorId },
      }),
    ]);

    revalidatePath("/dashboard/admin/users");
    return {
      success: true,
      title: "Access Removed",
      description:
        "Dashboard access has been restricted. All active roles have been archived.",
    };
  } catch (error: any) {
    return { success: false, description: error.message };
  }
}

// ─── Restore User ──────────────────────────────────────────────────────────────

export async function restoreUser(id: number): Promise<ActionResult> {
  await requireRole([...PERMISSION_ROLES.USERS_VIEW]);

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { deactivated_at: true, first_name: true },
    });

    if (!user || !user.deactivated_at) {
      return {
        success: false,
        description: "Access is already fully active for this user.",
      };
    }

    await prisma.$transaction([
      // Restore roles that were batch-deactivated with access_revoked flag
      prisma.userRole.updateMany({
        where: { user_id: id, is_active: false, access_revoked: true },
        data: { is_active: true, deactivated_at: null, access_revoked: false },
      }),
      prisma.user.update({
        where: { id },
        data: { deactivated_at: null, deactivated_by: null },
      }),
    ]);

    revalidatePath("/dashboard/admin/users");
    return {
      success: true,
      title: "Access Restored",
      description: "Access restored. Visit Manage Roles if changes are needed.",
    };
  } catch (error: any) {
    return { success: false, description: error.message };
  }
}

// ─── Delete User ───────────────────────────────────────────────────────────────

export async function deleteUser(id: number): Promise<ActionResult> {
  await requireRole([...PERMISSION_ROLES.SUPER_ADMIN]);

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        auth_id: true,
        account_status: true,
        created_at: true,
        is_qr_only: true,
      },
    });

    if (!user) return { success: false, description: "User not found." };

    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
    const isOldEnough =
      new Date().getTime() - new Date(user.created_at).getTime() >
      sevenDaysInMs;

    // A user is deletable if:
    // 1. Status is EXPIRED (always deletable because it's by definition > 7 days pending)
    // 2. Status is PENDING AND (is QR-only OR has been pending for more than 7 days)
    const isDeletable =
      user.account_status === ACCOUNT_STATUS.EXPIRED ||
      (user.account_status === ACCOUNT_STATUS.PENDING &&
        (user.is_qr_only || isOldEnough));

    if (!isDeletable) {
      const remainingDays = Math.ceil(
        (sevenDaysInMs -
          (new Date().getTime() - new Date(user.created_at).getTime())) /
          (24 * 60 * 60 * 1000),
      );
      return {
        success: false,
        title: "Action Restricted",
        description:
          user.account_status === ACCOUNT_STATUS.PENDING && !user.is_qr_only
            ? `New accounts cannot be deleted within 7 days of creation. Please wait ${remainingDays} more days or wait for the account to expire.`
            : "This account cannot be deleted in its current state.",
      };
    }

    if (user.auth_id) {
      const supabaseAdmin = createAdminClient();
      await supabaseAdmin.auth.admin.deleteUser(user.auth_id);
    }

    await prisma.$transaction([
      prisma.userRole.deleteMany({ where: { user_id: id } }),
      prisma.userChapter.deleteMany({ where: { user_id: id } }),
      prisma.user.delete({ where: { id } }),
    ]);

    revalidatePath("/dashboard/admin/users");
    return { success: true, title: "User Deleted" };
  } catch (error: any) {
    return { success: false, description: error.message };
  }
}

// ─── Resend Credentials ────────────────────────────────────────────────────────

export async function resendCredentials(id: number): Promise<ActionResult> {
  await requireRole([...PERMISSION_ROLES.USERS_VIEW]);

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        first_name: true,
        last_name: true,
        email: true,
        auth_id: true,
        is_qr_only: true,
        account_status: true,
        is_temp_password: true,
      },
    });

    if (!user) return { success: false, description: "User not found." };

    if (user.is_qr_only) {
      return {
        success: false,
        description: "QR-only members do not have login credentials.",
      };
    }

    if (!user.is_temp_password) {
      return {
        success: false,
        description: "This account has already been activated.",
      };
    }

    const isEligible =
      user.account_status === ACCOUNT_STATUS.PENDING ||
      user.account_status === ACCOUNT_STATUS.EXPIRED;

    if (!isEligible) {
      return {
        success: false,
        description:
          "Credentials can only be resent for pending or expired accounts.",
      };
    }

    if (!user.auth_id || !user.email) {
      return {
        success: false,
        description:
          "Account is missing auth credentials. Please contact support.",
      };
    }

    const tempPassword = generateTempPassword();
    const supabaseAdmin = createAdminClient();

    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      user.auth_id,
      { password: tempPassword },
    );

    if (authError) {
      return {
        success: false,
        title: "Auth Update Failed",
        description: authError.message,
      };
    }

    await prisma.user.update({
      where: { id },
      data: {
        activation_email_sent_at: new Date(),
        activation_email_resent: { increment: 1 },
      },
    });

    revalidatePath("/dashboard/admin/users");
    return {
      success: true,
      title: "Password Reset",
      description:
        "A new temporary password has been generated. Share credentials with the member manually.",
    };
  } catch (error: any) {
    return { success: false, description: error.message };
  }
}

// ─── Generate User QR ──────────────────────────────────────────────────────────

export async function generateUserQR(id: number): Promise<ActionResult> {
  const actor = await requireRole([
    ROLE_KEYS.DIRECTOR_ADVISER,
    ROLE_KEYS.ELDER,
    ROLE_KEYS.HEAD_SERVANT,
  ]);

  try {
    const targetUser = await prisma.user.findUnique({
      where: { id },
      include: { user_chapters: { where: { is_primary: true } } },
    });

    if (!targetUser) return { success: false, description: "User not found." };

    const isBypassed =
      actor.roles.includes(ROLE_KEYS.DIRECTOR_ADVISER) ||
      actor.roles.includes(ROLE_KEYS.ELDER);

    const now = new Date();
    if (!isBypassed && targetUser.qr_generated_at) {
      const lastGenDate = new Date(targetUser.qr_generated_at);
      const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
      const cooldownEnd = lastGenDate.getTime() + sevenDaysInMs;

      if (now.getTime() < cooldownEnd) {
        const remainingDays = Math.ceil(
          (cooldownEnd - now.getTime()) / (24 * 60 * 60 * 1000),
        );
        return {
          success: false,
          title: "Generation Cooldown",
          description: `QR Code was recently generated on ${lastGenDate.toLocaleDateString()}. You can regenerate again after ${new Date(cooldownEnd).toLocaleDateString()} (${remainingDays} ${remainingDays === 1 ? "day" : "days"} remaining).`,
        };
      }
    }

    const isHeadServantOnly =
      actor.roles.includes(ROLE_KEYS.HEAD_SERVANT) && !isBypassed;

    if (isHeadServantOnly) {
      const targetChapterId = targetUser.user_chapters[0]?.chapter_id;
      if (!actor.chapter || actor.chapter.id !== targetChapterId) {
        return {
          success: false,
          description:
            "You can only generate QR codes for members of your own chapter.",
        };
      }
    }

    const qrValue = crypto.randomUUID();

    await prisma.user.update({
      where: { id },
      data: {
        member_qr: qrValue,
        qr_generated_at: now,
        qr_regenerated_count: { increment: 1 },
        updated_by: actor.user.id,
      },
    });

    revalidatePath("/dashboard/admin/users");
    return {
      success: true,
      title: "QR Code Generated",
      description: "New QR code has been successfully generated.",
    };
  } catch (error: any) {
    return { success: false, description: error.message };
  }
}

// ─── Update User Roles ─────────────────────────────────────────────────────────

export type UserRoleInput = {
  roleId: number;
  chapterId?: number;
};

export async function updateUserRoles(
  userId: number,
  removeIds: number[],
  adds: UserRoleInput[],
): Promise<ActionResult> {
  const actor = await requireRole([...PERMISSION_ROLES.USERS_VIEW]);

  try {
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        user_roles: {
          include: { role: true, chapter: true },
        },
      },
    });

    if (!targetUser) {
      return {
        success: false,
        title: "User Not Found",
        description: "The targeted user account does not exist.",
      };
    }

    // Validate removes — block DA self-removal
    for (const removeId of removeIds) {
      const ur = targetUser.user_roles.find((r) => r.id === removeId);
      if (!ur) continue;
      if (
        ur.role.key === ROLE_KEYS.DIRECTOR_ADVISER &&
        userId === actor.user.id
      ) {
        return {
          success: false,
          title: "Cannot Remove Role",
          description:
            "You cannot remove your own Director Adviser role. Assign it to someone else first.",
        };
      }
    }

    const remainingRoles = targetUser.user_roles.filter(
      (ur) => ur.is_active && !removeIds.includes(ur.id),
    );

    const addRoleIds = [...new Set(adds.map((a) => a.roleId))];
    const resolvedRoleList =
      addRoleIds.length > 0
        ? await prisma.role.findMany({
            where: { id: { in: addRoleIds } },
            select: { id: true, key: true, name: true, scope: true },
          })
        : [];
    const roleById = new Map(resolvedRoleList.map((r) => [r.id, r]));

    const allChapterIds = [
      ...adds.filter((a) => a.chapterId).map((a) => a.chapterId!),
      ...remainingRoles
        .filter((ur) => ur.chapter_id)
        .map((ur) => ur.chapter_id!),
    ];
    const chapterList =
      allChapterIds.length > 0
        ? await prisma.chapter.findMany({
            where: { id: { in: allChapterIds } },
            select: { id: true, name: true },
          })
        : [];
    const chapterById = new Map(chapterList.map((c) => [c.id, c.name]));

    const queuedAdds: { roleKey: string; chapterId?: number }[] = [];
    let existingDAUserRoleId: number | null = null;

    for (const add of adds) {
      const role = roleById.get(add.roleId);
      if (!role) {
        return { success: false, description: `Role ${add.roleId} not found.` };
      }

      if (role.scope === "chapter" && !add.chapterId) {
        return {
          success: false,
          description: `Chapter is required for ${role.name}.`,
        };
      }

      const chapterName = add.chapterId
        ? (chapterById.get(add.chapterId) ?? "selected chapter")
        : null;

      switch (role.key) {
        case ROLE_KEYS.DIRECTOR_ADVISER: {
          if (!actor.roles.includes(ROLE_KEYS.DIRECTOR_ADVISER)) {
            return {
              success: false,
              title: "Unauthorized",
              description:
                "Only the current Director Adviser can assign this role.",
            };
          }
          const existingDA = await prisma.userRole.findFirst({
            where: {
              role: { key: ROLE_KEYS.DIRECTOR_ADVISER },
              is_active: true,
              user_id: { not: userId },
            },
          });
          if (existingDA) existingDAUserRoleId = existingDA.id;
          break;
        }

        case ROLE_KEYS.ELDER: {
          const alreadyHas =
            remainingRoles.some((ur) => ur.role.key === ROLE_KEYS.ELDER) ||
            queuedAdds.some((q) => q.roleKey === ROLE_KEYS.ELDER);
          if (alreadyHas)
            return {
              success: false,
              description: "Elder is already assigned to this user.",
            };
          break;
        }

        case ROLE_KEYS.MINISTRY_COORDINATOR: {
          const alreadyHas =
            remainingRoles.some(
              (ur) => ur.role.key === ROLE_KEYS.MINISTRY_COORDINATOR,
            ) ||
            queuedAdds.some(
              (q) => q.roleKey === ROLE_KEYS.MINISTRY_COORDINATOR,
            );
          if (alreadyHas)
            return {
              success: false,
              description:
                "Ministry Coordinator is already assigned to this user.",
            };
          break;
        }

        case ROLE_KEYS.FINANCE_HEAD: {
          const alreadyHas =
            remainingRoles.some(
              (ur) => ur.role.key === ROLE_KEYS.FINANCE_HEAD,
            ) || queuedAdds.some((q) => q.roleKey === ROLE_KEYS.FINANCE_HEAD);
          if (alreadyHas)
            return {
              success: false,
              description: "Finance Head is already assigned to this user.",
            };
          break;
        }

        case ROLE_KEYS.HEAD_SERVANT: {
          const existingHS = remainingRoles.find(
            (ur) => ur.role.key === ROLE_KEYS.HEAD_SERVANT,
          );
          const queuedHS = queuedAdds.find(
            (q) => q.roleKey === ROLE_KEYS.HEAD_SERVANT,
          );
          if (existingHS) {
            const c = existingHS.chapter_id
              ? (chapterById.get(existingHS.chapter_id) ?? "another chapter")
              : "another chapter";
            return {
              success: false,
              title: "Validation Error",
              description: `Head Servant can only be assigned to one chapter. Remove Head Servant from ${c} first.`,
            };
          }
          if (queuedHS)
            return {
              success: false,
              title: "Validation Error",
              description: "Head Servant can only be assigned to one chapter.",
            };

          const existingChapterHS = await prisma.userRole.findFirst({
            where: {
              role: { key: ROLE_KEYS.HEAD_SERVANT },
              chapter_id: add.chapterId,
              is_active: true,
              user_id: { not: userId },
            },
            include: {
              user: { select: { first_name: true, last_name: true } },
            },
          });
          if (existingChapterHS) {
            return {
              success: false,
              title: "Conflict Detected",
              description: `${chapterName} already has a Head Servant. Please remove them first.`,
            };
          }
          break;
        }

        case ROLE_KEYS.ASST_HEAD_SERVANT: {
          const sameChapter =
            remainingRoles.find(
              (ur) =>
                ur.role.key === ROLE_KEYS.ASST_HEAD_SERVANT &&
                ur.chapter_id === add.chapterId,
            ) ||
            queuedAdds.find(
              (q) =>
                q.roleKey === ROLE_KEYS.ASST_HEAD_SERVANT &&
                q.chapterId === add.chapterId,
            );
          if (sameChapter)
            return {
              success: false,
              description: `Asst. Head Servant is already assigned for ${chapterName}.`,
            };

          const diffChapter =
            remainingRoles.find(
              (ur) =>
                ur.role.key === ROLE_KEYS.ASST_HEAD_SERVANT &&
                ur.chapter_id !== add.chapterId,
            ) ||
            queuedAdds.find(
              (q) =>
                q.roleKey === ROLE_KEYS.ASST_HEAD_SERVANT &&
                q.chapterId !== add.chapterId,
            );
          if (diffChapter)
            return {
              success: false,
              description:
                "Asst. Head Servant can only be assigned to one chapter.",
            };
          break;
        }

        case ROLE_KEYS.FINANCE: {
          const sameChapter =
            remainingRoles.find(
              (ur) =>
                ur.role.key === ROLE_KEYS.FINANCE &&
                ur.chapter_id === add.chapterId,
            ) ||
            queuedAdds.find(
              (q) =>
                q.roleKey === ROLE_KEYS.FINANCE &&
                q.chapterId === add.chapterId,
            );
          if (sameChapter)
            return {
              success: false,
              description: `Finance is already assigned for ${chapterName}.`,
            };
          break;
        }

        case ROLE_KEYS.BUILDER: {
          const sameChapter =
            remainingRoles.find(
              (ur) =>
                ur.role.key === ROLE_KEYS.BUILDER &&
                ur.chapter_id === add.chapterId,
            ) ||
            queuedAdds.find(
              (q) =>
                q.roleKey === ROLE_KEYS.BUILDER &&
                q.chapterId === add.chapterId,
            );
          if (sameChapter)
            return {
              success: false,
              description: `Builder is already assigned for ${chapterName}.`,
            };

          const diffChapter =
            remainingRoles.find(
              (ur) =>
                ur.role.key === ROLE_KEYS.BUILDER &&
                ur.chapter_id !== add.chapterId,
            ) ||
            queuedAdds.find(
              (q) =>
                q.roleKey === ROLE_KEYS.BUILDER &&
                q.chapterId !== add.chapterId,
            );
          if (diffChapter)
            return {
              success: false,
              description: "Builder can only be assigned to one chapter.",
            };
          break;
        }

        case ROLE_KEYS.CLUSTER_HEAD: {
          const sameChapter =
            remainingRoles.find(
              (ur) =>
                ur.role.key === ROLE_KEYS.CLUSTER_HEAD &&
                ur.chapter_id === add.chapterId,
            ) ||
            queuedAdds.find(
              (q) =>
                q.roleKey === ROLE_KEYS.CLUSTER_HEAD &&
                q.chapterId === add.chapterId,
            );
          if (sameChapter)
            return {
              success: false,
              description: `Cluster Head is already assigned for ${chapterName}.`,
            };

          const diffChapter =
            remainingRoles.find(
              (ur) =>
                ur.role.key === ROLE_KEYS.CLUSTER_HEAD &&
                ur.chapter_id !== add.chapterId,
            ) ||
            queuedAdds.find(
              (q) =>
                q.roleKey === ROLE_KEYS.CLUSTER_HEAD &&
                q.chapterId !== add.chapterId,
            );
          if (diffChapter)
            return {
              success: false,
              description: "Cluster Head can only be assigned to one chapter.",
            };
          break;
        }
      }

      queuedAdds.push({ roleKey: role.key, chapterId: add.chapterId });
    }

    const now = new Date();
    const ops: any[] = [];

    if (removeIds.length > 0) {
      ops.push(
        prisma.userRole.updateMany({
          where: { id: { in: removeIds }, user_id: userId, is_active: true },
          data: { is_active: false, deactivated_at: now },
        }),
      );
    }

    if (existingDAUserRoleId !== null) {
      ops.push(
        prisma.userRole.update({
          where: { id: existingDAUserRoleId },
          data: { is_active: false, deactivated_at: now },
        }),
      );
    }

    for (const { roleId, chapterId } of adds) {
      const existingRecord = targetUser.user_roles.find(
        (ur) => ur.role_id === roleId && ur.chapter_id === (chapterId ?? null),
      );

      if (existingRecord) {
        ops.push(
          prisma.userRole.update({
            where: { id: existingRecord.id },
            data: {
              is_active: true,
              deactivated_at: null,
              assigned_by: actor.user.id,
              assigned_at: now,
            },
          }),
        );
      } else {
        ops.push(
          prisma.userRole.create({
            data: {
              user_id: userId,
              role_id: roleId,
              chapter_id: chapterId,
              assigned_by: actor.user.id,
              is_active: true,
            },
          }),
        );
      }
    }

    if (ops.length > 0) {
      await prisma.$transaction(ops);
    } else if (removeIds.length === 0) {
      return {
        success: true,
        title: "No Changes",
        description: "No roles were added or removed.",
      };
    }

    revalidatePath("/dashboard/admin/users");
    return {
      success: true,
      title: "Roles Updated",
      description: "User roles have been successfully updated.",
    };
  } catch (error: any) {
    console.error("[updateUserRoles] error:", error);
    return {
      success: false,
      title: "Update Failed",
      description: error.message || "An unexpected error occurred.",
    };
  }
}
