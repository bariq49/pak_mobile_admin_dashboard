"use client";

import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  User,
  Settings,
  Users,
  UserPlus,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/provider/auth.provider";

const ProfileInfo = () => {
  const { user, logout } = useAuth();
  const firstLetter = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="cursor-pointer">
        <div className="flex items-center">
          <Avatar className="w-9 h-9  border-2 border-white dark:border-dark-700">
            {user?.avatar ? (
              <AvatarImage src={user.avatar} alt={user.name ?? "User"} />
            ) : (
              <AvatarFallback>{firstLetter}</AvatarFallback>
            )}
          </Avatar>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56 p-0" align="end">
        <DropdownMenuLabel className="flex gap-2 items-center mb-1 p-3">
          <Avatar className="w-9 h-9 border-2 border-white dark:border-dark-700">
            {user?.avatar ? (
              <AvatarImage src={user.avatar} alt={user.name ?? "User"} />
            ) : (
              <AvatarFallback>{firstLetter}</AvatarFallback>
            )}
          </Avatar>
          <div>
            <div className="text-sm font-medium text-default-800 capitalize">
              {user?.name ?? "Guest User"}
            </div>
            <div className="text-xs text-default-600">
              {user?.email ?? "user@example.com"}
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuGroup>
          {[
            {
              name: "Profile",
              icon: <User className="w-4 h-4" />,
              href: "/user-profile",
            },
            {
              name: "Settings",
              icon: <Settings className="w-4 h-4" />,
              href: "/dashboard",
            },
          ].map((item, index) => (
            <Link href={item.href} key={index} className="cursor-pointer">
              <DropdownMenuItem className="flex items-center gap-2 text-sm font-medium text-default-600 capitalize px-3 py-1.5 dark:hover:bg-background">
                {item.icon}
                {item.name}
              </DropdownMenuItem>
            </Link>
          ))}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <Link href="/dashboard">
            <DropdownMenuItem className="flex items-center gap-2 text-sm font-medium text-default-600 capitalize px-3 py-1.5 dark:hover:bg-background">
              <Users className="w-4 h-4" />
              Team
            </DropdownMenuItem>
          </Link>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex items-center gap-2 text-sm font-medium text-default-600 capitalize px-3 py-1.5 dark:hover:bg-background">
              <UserPlus className="w-4 h-4" />
              Invite user
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                {["email", "message", "facebook"].map((item, index) => (
                  <Link href="/dashboard" key={index}>
                    <DropdownMenuItem className="text-sm font-medium text-default-600 capitalize px-3 py-1.5 dark:hover:bg-background">
                      {item}
                    </DropdownMenuItem>
                  </Link>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onSelect={logout}
          className="flex items-center gap-2 text-sm font-medium text-default-600 capitalize my-1 px-3 dark:hover:bg-background cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileInfo;
