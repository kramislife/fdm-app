export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md">
        <div className="mb-5 text-center">
          <h1 className="text-xl font-bold md:text-2xl lg:text-3xl text-primary">
            Friends of the Divine Mercy
          </h1>
          <p className="mt-1 text-xs md:text-sm text-muted-foreground">
            Community Management System
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
