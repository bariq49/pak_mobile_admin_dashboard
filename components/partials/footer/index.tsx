import React from "react";
import { useSidebar, useThemeStore } from "@/store";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import MobileFooter from "./mobile-footer";
import FooterLayout from "./footer-layout";
import { useMounted } from "@/hooks/use-mounted";

const Footer = ({ handleOpenSearch }: { handleOpenSearch: () => void }) => {
  const { collapsed, sidebarType } = useSidebar();
  const { layout, footerType } = useThemeStore();
  const mounted = useMounted();
  const isMobile = useMediaQuery("(min-width: 768px)");

  if (!mounted) {
    return null;
  }
  return (
    <div className="xl:mx-20 mx-6">
    <FooterLayout
      className={cn(" rounded-md border sticky bottom-4", {
        "ltr:xl:ml-[72px] rtl:xl:mr-[72px]": collapsed,
        "ltr:xl:ml-[272px] rtl:xl:mr-[272px]": !collapsed,
      })}
    >
      <FooterContent />
    </FooterLayout>
  </div>
  );
};

export default Footer;

const FooterContent = () => {
  return (
    <div className="block md:flex md:justify-between text-muted-foreground">
      <p className="sm:mb-0 text-xs md:text-sm">
        COPYRIGHT © {new Date().getFullYear()} Pak Mobile Store All rights Reserved
      </p>
      <p className="mb-0 text-xs md:text-sm">
        Made by{" "}
        <a
          className="text-primary"
          target="__blank"
          href="#"
        >
          Pak Mobile Store
        </a>
      </p>
    </div>
  );
};
