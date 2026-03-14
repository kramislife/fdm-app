"use client";

import { createContext, useContext } from "react";
import type { DashboardSessionUser } from "@/lib/types";

const UserContext = createContext<DashboardSessionUser | null>(null);

export function UserProvider({
  children,
  user,
}: {
  children: React.ReactNode;
  user: DashboardSessionUser;
}) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export function useUser(): DashboardSessionUser {
  const user = useContext(UserContext);
  if (!user) throw new Error("useUser must be called inside <UserProvider>");
  return user;
}
