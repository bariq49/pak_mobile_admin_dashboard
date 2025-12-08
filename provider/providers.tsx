"use client";
import { Inter } from "next/font/google";
import { useThemeStore } from "@/store";
import { ThemeProvider } from "next-themes";
import { cn } from "@/lib/utils";
import { Toaster as ReactToaster } from "@/components/ui/toaster";
import { Toaster } from "react-hot-toast";
import { SonnToaster } from "@/components/ui/sonner";
import { usePathname } from "next/navigation";
import { CurrencyProvider } from "./currency.provider";

const inter = Inter({ subsets: ["latin"] });

const Providers = ({ children }: { children: React.ReactNode }) => {
  const { theme, radius } = useThemeStore();
  const location = usePathname();

  const AppProviders = (
    <CurrencyProvider>
      <ThemeProvider attribute="class" enableSystem={false} defaultTheme="light">
        <div className={cn("h-full")}>{children}</div>
        <ReactToaster />
        <Toaster />
        <SonnToaster />
      </ThemeProvider>
    </CurrencyProvider>
  );

  if (location === "/") {
    return (
      <body className={cn("dash-tail-app", inter.className)}>
        {AppProviders}
      </body>
    );
  }

  return (
    <body
      className={cn("dash-tail-app", inter.className, "theme-" + theme)}
      style={{
        "--radius": `${radius}rem`,
      } as React.CSSProperties}
    >
      {AppProviders}
    </body>
  );
};

export default Providers;
