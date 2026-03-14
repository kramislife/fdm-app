"use client";

import { createContext, useContext, useState } from "react";
import type { AppRole } from "@/config/sidebar-navigation";

export interface MockUser {
  id: string;
  name: string;
  email: string;
  role: AppRole;
  chapter: string;
  initials: string;
}

interface UserContextValue {
  user: MockUser;
  setRole: (role: AppRole) => void;
}

const MOCK_USER: MockUser = {
  id: "mock-001",
  name: "Mark Reyes",
  email: "mark@fdm.org",
  role: "sd",
  chapter: "Quezon City",
  initials: "MR",
};

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MockUser>(MOCK_USER);

  function setRole(role: AppRole) {
    setUser((prev) => ({ ...prev, role }));
  }

  return (
    <UserContext.Provider value={{ user, setRole }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
