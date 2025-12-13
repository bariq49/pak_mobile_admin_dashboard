"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/store";
import { useMediaQuery } from "@/hooks/use-media-query";

import VerticalHeader from "./vertical-header";
import ClassicHeader from "./layout/classic-header";
import FullScreen from "./full-screen";
import Inbox from "./inbox";
import NotificationMessage from "./notification-message";
import ProfileInfo from "./profile-info";
import MobileMenuHandler from "./mobile-menu-handler";
import ThemeButton from "./theme-button";
import CurrencySwitcher from "./currency-switcher";

const NavTools = ({
  isDesktop,
  sidebarType,
}: {
  isDesktop: boolean;
  sidebarType: string;
}) => {
  return (
    <div className="nav-tools flex items-center gap-2">
      {isDesktop && <FullScreen />}
      <ThemeButton />
      <CurrencySwitcher /> 
      <Inbox />
      <NotificationMessage />
      <div className="pl-2">
        <ProfileInfo />
      </div>
      {!isDesktop && sidebarType !== "module" && <MobileMenuHandler />}
    </div>
  );
};

const Header = ({
  handleOpenSearch,
}: {
  handleOpenSearch: () => void;
}) => {
  const { collapsed, sidebarType } = useSidebar();
  const isDesktop = useMediaQuery("(min-width: 1280px)");

  return (
    <ClassicHeader
      className={cn(
        "has-sticky-header rounded-md sticky top-6 z-50 transition-all duration-300 mb-16",
        {
          "xl:ml-[72px]": collapsed,
          "xl:ml-[272px]": !collapsed,
        }
      )}
    >
      <div className="xl:mx-20 mx-4">
        <div className="w-full bg-card/90 backdrop-blur-lg md:px-6 px-[15px] py-3 rounded-md shadow-md border-b">
          <div className="flex justify-between items-center h-full">
            <VerticalHeader handleOpenSearch={handleOpenSearch} />
            <NavTools isDesktop={isDesktop} sidebarType={sidebarType} />
          </div>
        </div>
      </div>
    </ClassicHeader>
  );
};

export default Header;
