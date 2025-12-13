"use client";
import React from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import PopoverSidebar from "./popover";
import MobileSidebar from "./mobile-sidebar";

const Sidebar = () => {
  const isDesktop = useMediaQuery("(min-width: 1280px)");
  return (
    <div className="transition-all duration-150">
      {isDesktop ? (
        <PopoverSidebar />
      ) : (
        <MobileSidebar />
      )}
    </div>
  );
};

export default Sidebar;
