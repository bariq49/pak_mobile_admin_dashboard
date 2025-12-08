"use client";

import React, { createContext, useContext, useEffect } from "react";
import Cookies from "js-cookie";
import { useMounted } from "@/hooks/use-mounted";
import {
  useGetCurrentUserQuery,
  useLogoutMutation,
} from "@/hooks/api/use-auth-api";
import { usePathname, useRouter } from "next/navigation";

interface User {
  dateOfBirth: any;
  gender: string;
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  completeAddress: string;
  createdAt: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const token = Cookies.get("auth_token");
  const mounted = useMounted();
  const pathname = usePathname();
  const router = useRouter();
  const isAuthRoute = pathname.startsWith("/auth");

  const {
    data: user,
    isLoading,
    refetch,
  } = useGetCurrentUserQuery({
    enabled: !!token && !isAuthRoute,
  });
  const { mutate: logoutMutation } = useLogoutMutation();

  useEffect(() => {
    if (!mounted) return;
    if (isAuthRoute) return;
    if (isLoading) return;

    // Redirect unauthenticated users to login
    if (!token || !user) {
      Cookies.remove("auth_token");
      router.replace("/auth/login");
      return;
    }
  }, [mounted, isLoading, token, user, router, isAuthRoute]);

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        loading: isLoading,
        logout: logoutMutation,
        refreshUser: refetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export default AuthProvider;
