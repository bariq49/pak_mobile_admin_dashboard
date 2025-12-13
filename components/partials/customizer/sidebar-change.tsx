import React from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useSidebar, useThemeStore } from "@/store";
import { themes } from "@/config/thems";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

// Simple layout SVG components
const VerticalLayout = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 60" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="5" width="25" height="50" rx="2" className="fill-default-300" />
    <rect x="35" y="5" width="60" height="50" rx="2" className="fill-default-400" />
  </svg>
);

const SemiBoxLayout = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 60" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="5" width="20" height="50" rx="2" className="fill-default-300" />
    <rect x="30" y="5" width="65" height="50" rx="2" className="fill-default-400" />
  </svg>
);

const sidebarOptions = [
  {
    key: "module",
    label: "Module",
    disabled: (layout: string) => layout === "semibox" || layout === "horizontal",
    svg: <VerticalLayout className="w-full h-full" />,
  },
  {
    key: "classic",
    label: "Classic",
    disabled: (layout: string) => layout === "semibox",
    svg: <SemiBoxLayout className="w-full h-full" />,
  },
  {
    key: "popover",
    label: "Popover",
    svg: <SemiBoxLayout className="w-full h-full" />,
  },
];

const SidebarChange = () => {
  const { sidebarType, setSidebarType } = useSidebar();

  const { theme, setTheme, resolvedTheme: mode } = useTheme();
  const { theme: config, setTheme: setConfig, layout } = useThemeStore();
  const newTheme = themes.find((theme) => theme.name === config);

  return (
    <div
      style={{
        "--theme-primary": `hsl(${newTheme?.cssVars[mode === "dark" ? "dark" : "light"].primary
          })`,
      } as React.CSSProperties

      }
    >
      <div className="mb-2 relative inline-block px-3 py-[3px] rounded-md before:bg-[--theme-primary] before:absolute before:top-0 before:left-0 before:w-full  before:h-full before:rounded before:opacity-10 before:z-[-1]  text-[--theme-primary]  text-xs font-medium">
        Sidebar Layout
      </div>
      <div className="text-muted-foreground font-normal text-xs mb-4">
        Choose your layout
      </div>
      <div className=" grid grid-cols-3 gap-3">
        {sidebarOptions.map((sidebarOption) => (
          <div key={sidebarOption.key}>
            <button
              onClick={() => setSidebarType(sidebarOption.key)}
              disabled={
                sidebarOption.disabled && sidebarOption.disabled(layout)
              }
              className={cn(
                " border block  rounded relative h-[72px] w-full disabled:cursor-not-allowed",
                {
                  "text-[--theme-primary] border-[--theme-primary]":
                    sidebarType === sidebarOption.key,
                  "text-muted-foreground border-border":
                    sidebarType !== sidebarOption.key,
                }
              )}
            >
              {sidebarType === sidebarOption.key && (
                <CheckCircle2
                  className=" text-[--theme-primary] absolute top-1 right-1"
                />
              )}
              {sidebarOption.svg}
            </button>

            <Label className=" text-muted-foreground font-normal block mt-2">
              {sidebarOption.label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SidebarChange;
