import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
  }

  // Save auth_id to profile if not already set
  await prisma.user.updateMany({
    where: { email: user.email!, auth_id: null },
    data: { auth_id: user.id },
  });

  const dbUser = await prisma.user.findUnique({
    where: { auth_id: user.id },
  });

  if (dbUser?.is_temp_password) {
    return NextResponse.redirect(`${origin}/first-login`);
  }

  return NextResponse.redirect(`${origin}/dashboard`);
}
