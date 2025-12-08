"use client";

import { Breadcrumbs, BreadcrumbItem } from "@/components/ui/breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Edit, Home } from "lucide-react";
import coverImage from "@/public/images/all-img/user-cover.png";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { Fragment } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/provider/auth.provider";

const Header = () => {
  const location = usePathname();
  const { user, loading } = useAuth();

  const firstLetter = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  // Loading state
  if (loading) {
    return (
      <Fragment>
        <Breadcrumbs>
          <BreadcrumbItem>
            <Home className="h-4 w-4" />
          </BreadcrumbItem>
          <BreadcrumbItem>Pages</BreadcrumbItem>
          <BreadcrumbItem>Utility</BreadcrumbItem>
          <BreadcrumbItem>User Profile</BreadcrumbItem>
        </Breadcrumbs>

        {/* Loading Card */}
        <Card className="mt-6 rounded-t-2xl">
          <CardContent className="p-0">
            <div
              className="relative h-[200px] lg:h-[296px] rounded-t-2xl w-full object-cover bg-no-repeat"
              style={{ backgroundImage: `url(${coverImage.src})` }}
            >
              <div className="flex items-center gap-4 absolute ltr:left-10 rtl:right-10 -bottom-2 lg:-bottom-8">
                {/* Loading Avatar */}
                <div className="h-20 w-20 lg:w-32 lg:h-32 border-2 border-primary dark:border-primary rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />

                <div className="space-y-2">
                  <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
              </div>

              {/* Loading Edit Button */}
              <div className="absolute bottom-5 ltr:right-6 rtl:left-6 rounded px-5 hidden lg:flex">
                <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            </div>

            {/* Loading Navigation Links */}
            <div className="flex flex-wrap justify-end gap-4 lg:gap-8 pt-7 lg:pt-5 pb-4 px-6">
              {[1, 2].map((item) => (
                <div
                  key={`loading-link-${item}`}
                  className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </Fragment>
    );
  }

  return (
    <Fragment>
      <Breadcrumbs>
        <BreadcrumbItem>
          <Home className="h-4 w-4" />
        </BreadcrumbItem>
        <BreadcrumbItem>Pages</BreadcrumbItem>
        <BreadcrumbItem>Utility</BreadcrumbItem>
        <BreadcrumbItem>User Profile</BreadcrumbItem>
      </Breadcrumbs>

      {/* Card */}
      <Card className="mt-6 rounded-t-2xl">
        <CardContent className="p-0">
          <div
            className="relative h-[200px] lg:h-[296px] rounded-t-2xl w-full object-cover bg-no-repeat"
            style={{ backgroundImage: `url(${coverImage.src})` }}
          >
            <div className="flex items-center gap-4 absolute ltr:left-10 rtl:right-10 -bottom-2 lg:-bottom-8">
              {/* Avatar with same border color as UserMeta for both light and dark mode */}
              <Avatar className="h-20 w-20 lg:w-32 lg:h-32 border-2 border-primary dark:border-primary bg-muted dark:bg-muted">
                {user?.avatar ? (
                  <AvatarImage
                    src={user.avatar}
                    alt={user.name ?? "User"}
                    className="object-cover"
                  />
                ) : (
                  <AvatarFallback className="text-2xl lg:text-4xl font-bold text-primary dark:text-primary bg-transparent">
                    {firstLetter}
                  </AvatarFallback>
                )}
              </Avatar>

              <div>
                <div className="text-xl lg:text-2xl font-semibold text-primary-foreground mb-1">
                  {user?.name ?? "Guest User"}
                </div>
                <div className="text-xs lg:text-sm font-medium text-default-100 dark:text-default-900 pb-1.5">
                  {user?.email ?? "User Email"} . {user?.role ?? "User Role"}
                </div>
              </div>
            </div>

            {/* Edit Button */}
            <Button
              asChild
              className="absolute bottom-5 ltr:right-6 rtl:left-6 rounded px-5 hidden lg:flex"
              size="sm"
            >
              <Link href="/user-profile/settings" className="flex items-center">
                <Edit className="w-4 h-4 ltr:mr-1 rtl:ml-1" />
                Edit
              </Link>
            </Button>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap justify-end gap-4 lg:gap-8 pt-7 lg:pt-5 pb-4 px-6">
            {[
              { title: "Overview", link: "/user-profile" },
              { title: "Settings", link: "/user-profile/settings" },
            ].map((item, index) => (
              <Link
                key={`user-profile-link-${index}`}
                href={item.link}
                className={cn(
                  "text-sm font-semibold text-default-500 hover:text-primary relative lg:before:absolute before:-bottom-4 before:left-0 before:w-full lg:before:h-[1px] before:bg-transparent",
                  {
                    "text-primary dark:text-primary lg:before:bg-primary dark:before:bg-primary":
                      location === item.link,
                  }
                )}
              >
                {item.title}
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </Fragment>
  );
};

export default Header;
