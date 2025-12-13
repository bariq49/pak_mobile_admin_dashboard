"use client";
import React from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const SubMenuHandler = ({
  item,
  toggleSubmenu,
  index,
  activeSubmenu,
  collapsed,
  hovered,
}: {
  item: any;
  toggleSubmenu: any;
  index: number;
  activeSubmenu: number | null;
  collapsed: boolean;
  hovered: boolean;
}) => {
  const { title, icon: Icon } = item;
  
  // Handle icon - it might be a component or an object with default
  const IconComponent = React.useMemo(() => {
    if (!Icon) return null;
    if (typeof Icon === 'function') return Icon;
    if (Icon?.default && typeof Icon.default === 'function') return Icon.default;
    if (Icon?.ReactComponent && typeof Icon.ReactComponent === 'function') return Icon.ReactComponent;
    return null;
  }, [Icon]);
  
  // Only render if IconComponent is a valid React component (function)
  const renderIcon = (className: string) => {
    if (!IconComponent || typeof IconComponent !== 'function') return null;
    return <IconComponent className={className} />;
  };

  return (
    <>
      {!collapsed || hovered ? (
        <div
          onClick={() => toggleSubmenu(index)}
          className={cn(
            "flex  text-default-700 group font-medium text-sm capitalize px-[10px] py-3 rounded cursor-pointer transition-all duration-100 hover:bg-primary hover:text-primary-foreground group",
            {
              "bg-primary  text-primary-foreground": activeSubmenu === index,
            }
          )}
        >
          <div className="flex-1  gap-3 flex items-start">
            <span className="inline-flex items-center     ">
              {renderIcon("w-5 h-5")}
            </span>
            <div className=" ">{title}</div>
          </div>
          <div className="flex-0">
            <div
              className={cn(
                " text-base rounded-full flex justify-center items-center transition-all duration-300 group-hover:text-primary-foreground",
                {
                  "rotate-90  ": activeSubmenu === index,
                  " text-default-500  ": activeSubmenu !== index,
                }
              )}
            >
              <ChevronRight className="h-5 w-5" />
            </div>
          </div>
        </div>
      ) : (
        <div className="inline-flex cursor-pointer items-center justify-center data-[state=open]:bg-primary-100 data-[state=open]:text-primary  w-12 h-12  rounded-md">
          {renderIcon("w-6 h-6")}
        </div>
      )}
    </>
  );
};

export default SubMenuHandler;
