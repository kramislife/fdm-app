import type { Metadata } from "next";
import { SetPasswordForm } from "./set-password-form";

export const metadata: Metadata = {
  title: "Activate Account | FDM",
  description:
    "Secure your account and join the Friends of the Divine Mercy community.",
};

export default function FirstLoginPage() {
  return <SetPasswordForm />;
}
