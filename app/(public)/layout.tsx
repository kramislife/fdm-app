import { createClient } from "@/lib/supabase/server";
import { getUserWithRoles, buildSessionUser } from "@/lib/auth/session-utils";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let sessionUser: ReturnType<typeof buildSessionUser> | null = null;

  if (user) {
    const dbUser = await getUserWithRoles(user.id);
    if (dbUser) sessionUser = buildSessionUser(dbUser);
  }

  return (
    <>
      <div className="flex flex-col min-h-screen max-w-480 mx-auto">
        <PublicHeader sessionUser={sessionUser} />
        <main className="flex-1 pt-15 border-x">{children}</main>
        <PublicFooter />
      </div>
    </>
  );
}
