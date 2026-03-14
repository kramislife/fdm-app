import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function MyQRPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-2xl px-5 py-12 space-y-4">
      <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">My QR Code</h1>
      <div className="rounded-lg border border-dashed border-border p-12 text-center">
        <p className="text-sm text-muted-foreground">Coming soon</p>
      </div>
    </div>
  );
}
