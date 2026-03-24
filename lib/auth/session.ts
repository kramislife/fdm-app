import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/prisma";

export async function getCurrentUser() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const dbUser = await prisma.user.findUnique({
    where: { auth_id: user.id },
    include: {
      user_roles: {
        where: { is_active: true },
        include: { role: true },
      },
    },
  });

  return dbUser;
}
