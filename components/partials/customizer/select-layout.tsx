import React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { themes } from "@/config/thems";
import { useThemeStore } from "@/store";
import { useTheme } from "next-themes";
import { CheckCircle2 } from "lucide-react";

// Simple layout SVG components
const VerticalLayout = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 60" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="5" width="25" height="50" rx="2" className="fill-default-300" />
    <rect x="35" y="5" width="60" height="50" rx="2" className="fill-default-400" />
  </svg>
);

const HorizontalLayout = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 60" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="5" width="90" height="15" rx="2" className="fill-default-300" />
    <rect x="5" y="25" width="90" height="30" rx="2" className="fill-default-400" />
  </svg>
);

const SemiBoxLayout = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 60" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="5" width="20" height="50" rx="2" className="fill-default-300" />
    <rect x="30" y="5" width="65" height="50" rx="2" className="fill-default-400" />
  </svg>
);

const layoutOptions = [
  {
    key: "vertical",
    label: "Vertical",
    svg: <VerticalLayout className="w-full h-full" />,
  },
  {
    key: "horizontal",
    label: "Horizontal",
    svg: <HorizontalLayout className="w-full h-full" />,
  },
  {
    key: "semibox",
    label: "Semi-Box",
    svg: <SemiBoxLayout className="w-full h-full" />,
  },
];

const SelectLayout = () => {
  const { layout, setLayout } = useThemeStore();
  const { theme, setTheme, resolvedTheme: mode } = useTheme();
  const { theme: config, setTheme: setConfig } = useThemeStore();
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
        Layout
      </div>
      <div className="text-muted-foreground font-normal text-xs mb-4">
        Choose your layout
      </div>
      <div className=" grid grid-cols-3 gap-3">
        {layoutOptions.map((layoutOption) => (
          <div key={layoutOption.key}>
            <button
              onClick={() => setLayout(layoutOption.key)}
              className={cn("border block  rounded relative h-[72px] w-full", {
                "text-[--theme-primary] border-[--theme-primary]":
                  layout === layoutOption.key,
                "text-muted-foreground border-border":
                  layout !== layoutOption.key,
              })}
            >
              {layout === layoutOption.key && (
                <CheckCircle2
                  className=" text-[--theme-primary] absolute top-1 right-1"
                />
              )}
              {layoutOption.svg}
            </button>

            <Label className=" text-muted-foreground font-normal block mt-2">
              {layoutOption.label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SelectLayout;
