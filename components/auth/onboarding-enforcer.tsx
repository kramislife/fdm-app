import { createClient } from "@/lib/supabase/server";
import { getUserWithRoles } from "@/lib/auth/session-utils";
import { OnboardingModal } from "./onboarding-modal";

export async function OnboardingEnforcer() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const dbUser = await getUserWithRoles(user.id);
  if (!dbUser) return null;

  // Always render the modal so React keeps the component alive across
  // the automatic server re-render that follows the completeFirstLogin action.
  // The modal manages its own open state via defaultOpen.
  return (
    <OnboardingModal
      firstName={dbUser.first_name ?? "User"}
      defaultOpen={dbUser.is_temp_password}
    />
  );
}
