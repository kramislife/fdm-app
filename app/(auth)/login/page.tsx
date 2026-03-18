import { LoginForm } from "./login-form";
import { AUTH_ERROR_CODES, isAuthErrorCode, type AuthErrorCode } from "@/lib/auth-errors";

interface LoginPageProps {
  searchParams: Promise<{ error?: string; date?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const authError: AuthErrorCode | undefined = isAuthErrorCode(params.error)
    ? params.error
    : undefined;
  const provisionedDate =
    authError === AUTH_ERROR_CODES.PROVISIONED && params.date
      ? params.date
      : undefined;

  return <LoginForm provisionedDate={provisionedDate} authError={authError} />;
}
