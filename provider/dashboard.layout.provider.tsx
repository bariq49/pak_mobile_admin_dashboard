"use client";
import React from "react";
import Header from "@/components/partials/header";
import Sidebar from "@/components/partials/sidebar";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/store";
import { motion } from "framer-motion";
import Footer from "@/components/partials/footer";
import { useMediaQuery } from "@/hooks/use-media-query";
import ThemeCustomize from "@/components/partials/customizer/theme-customizer";
import MobileSidebar from "@/components/partials/sidebar/mobile-sidebar";
import HeaderSearch from "@/components/header-search";
import { useMounted } from "@/hooks/use-mounted";
import LayoutLoader from "@/components/layout-loader";

const DashBoardLayoutProvider = ({
  children,
  trans,
}: {
  children: React.ReactNode;
  trans: any;
}) => {
  const { collapsed } = useSidebar();
  const [open, setOpen] = React.useState(false);
  const isMobile = useMediaQuery("(min-width: 768px)");
  const mounted = useMounted();

  if (!mounted) {
    return <LayoutLoader />;
  }
  return (
    <>
      <Header handleOpenSearch={() => setOpen(true)} trans={trans} />
      <Sidebar trans={trans} />

      <div
        className={cn("content-wrapper transition-all duration-150 ", {
          "ltr:xl:ml-[72px] rtl:xl:mr-[72px]": collapsed,
          "ltr:xl:ml-[272px] rtl:xl:mr-[272px]": !collapsed,
        })}
      >
        <div className={cn("pt-6 pb-8 px-4 page-min-height-semibox")}>
          <div className="semibox-content-wrapper">
            <LayoutWrapper
              isMobile={isMobile}
              setOpen={setOpen}
              open={open}
              trans={trans}
            >
              {children}
            </LayoutWrapper>
          </div>
        </div>
      </div>

      <Footer handleOpenSearch={() => setOpen(true)} />
      <ThemeCustomize />
    </>
  );
};

export default DashBoardLayoutProvider;

const LayoutWrapper = ({
  children,
  isMobile,
  setOpen,
  open,
  trans,
}: {
  children: React.ReactNode;
  isMobile: boolean;
  setOpen: any;
  open: boolean;
  trans: any;
}) => {
  return (
    <>
      <motion.div
        initial="pageInitial"
        animate="pageAnimate"
        exit="pageExit"
        variants={{
          pageInitial: { opacity: 0, y: 50 },
          pageAnimate: { opacity: 1, y: 0 },
          pageExit: { opacity: 0, y: -50 },
        }}
        transition={{
          type: "tween",
          ease: "easeInOut",
          duration: 0.5,
        }}
      >
        <main>{children}</main>
      </motion.div>

      <MobileSidebar trans={trans} className="left-[300px]" />
      <HeaderSearch open={open} setOpen={setOpen} />
    </>
  );
};
