"use client";

import React from "react";
import { useAuth } from "@/provider/auth.provider";
import { LogOut } from "lucide-react";

const LogoutFooter = () => {
  const { user, logout } = useAuth();

  return (
    <>
      <div className="bg-default-50 dark:bg-default-200 flex items-center gap-3 px-4 py-2 mt-5">
        <div className="flex-1">
          <div className="text-default-700 font-semibold text-sm capitalize mb-0.5 truncate">
            {user?.name ?? "Guest User"}
          </div>
          <div className="text-xs text-default-600 truncate">
            {user?.email ?? "example@example.com"}
          </div>
        </div>

        <div className="flex-none">
          <button
            type="button"
            onClick={logout}
            className="text-default-500 inline-flex h-9 w-9 rounded items-center justify-center dark:bg-default-300 dark:text-default-900"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
};

export default LogoutFooter;
