import { LoginForm } from "./login-form";

interface LoginPageProps {
  searchParams: Promise<{ error?: string; date?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const provisionedDate =
    params.error === "provisioned" && params.date ? params.date : undefined;

  return <LoginForm provisionedDate={provisionedDate} />;
}
