export const AUTH_ERROR_CODES = {
  AUTH_FAILED: "auth_failed",
  INVALID_GOOGLE_EMAIL: "invalid_google_email",
  PROVISIONED: "provisioned",
} as const;

export type AuthErrorCode =
  (typeof AUTH_ERROR_CODES)[keyof typeof AUTH_ERROR_CODES];

export function isAuthErrorCode(value: string | undefined): value is AuthErrorCode {
  return !!value && Object.values(AUTH_ERROR_CODES).includes(value as AuthErrorCode);
}

export function buildLoginErrorPath(
  code: AuthErrorCode,
  params?: { date?: string },
) {
  const search = new URLSearchParams({ error: code });

  if (params?.date) {
    search.set("date", params.date);
  }

  return `/login?${search.toString()}`;
}
