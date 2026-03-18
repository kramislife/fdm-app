// "use server";

// import { requireRole } from "@/lib/auth";
// import { prisma } from "@/lib/prisma";
// import { revalidatePath } from "next/cache";

// export async function updateUserRole(
//   id: number,
//   data: { role_id: string },
// ): Promise<{ success: boolean; error?: string; description?: string }> {
//   try {
//     await requireRole([
//       "spiritual_director",
//       "elder",
//       "head_servant",
//       "asst_head_servant",
//     ]);

//     const roleId = parseInt(data.role_id, 10);
//     if (isNaN(roleId)) {
//       return { success: false, error: "Invalid role ID" };
//     }

//     // Get the user's existing role
//     const existingRole = await prisma.userRole.findFirst({
//       where: { user_id: id },
//     });

//     if (!existingRole) {
//       return { success: false, error: "User has no role assigned" };
//     }

//     // Update the role
//     await prisma.userRole.update({
//       where: { id: existingRole.id },
//       data: { role_id: roleId },
//     });

//     revalidatePath("/dashboard/admin/users");
//     return { success: true, description: "User role updated successfully" };
//   } catch (error) {
//     const message = error instanceof Error ? error.message : "Unknown error";
//     return { success: false, error: message };
//   }
// }
