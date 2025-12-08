"use client";

import React from "react";
import { Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/provider/auth.provider";

const FooterMenu = () => {
  const { user } = useAuth();
  const firstLetter = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <div className="space-y-5 flex flex-col items-center justify-center pb-6">
      {/* Settings button */}
      <button className="w-11 h-11 mx-auto text-default-500 flex items-center justify-center rounded-md transition-all duration-200 hover:bg-primary hover:text-primary-foreground">
        <Settings className="h-8 w-8" />
      </button>

      {/* User Avatar */}
      <div>
        <Avatar className="w-9 h-9  border-2 border-white dark:border-dark-700">
          {user?.avatar ? (
            <AvatarImage src={user.avatar} alt={user.name ?? "User"} />
          ) : (
            <AvatarFallback>{firstLetter}</AvatarFallback>
          )}
        </Avatar>
      </div>
    </div>
  );
};

export default FooterMenu;
