import React from "react";
import { cn, isLocationMatch } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useThemeStore } from "@/store";

function NavLink({ childItem, locationName }: {
  childItem: any;
  locationName: string;
}) {
  const { href, icon: Icon, title, badge } = childItem;
  
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
    <Link
      href={href}
      className={cn(
        "flex  font-medium  text-sm capitalize px-[10px] py-3 gap-3 rounded-md cursor-pointer",
        {
          "bg-primary text-primary-foreground": isLocationMatch(
            href,
            locationName
          ),
          " text-default-600": !isLocationMatch(href, locationName),
        }
      )}
    >
      {IconComponent && (
        <span className="inline-flex items-center   flex-grow-0">
          {renderIcon("h-5 w-5")}
        </span>
      )}
      <div className="flex-grow truncate">{title}</div>
      {badge && <Badge className="rounded h-min ">{badge}</Badge>}
    </Link>
  );
}

const MenuItem = ({
  childItem,
  toggleNested,
  nestedIndex,
  index,
  locationName,
}: {
  childItem: any;
  toggleNested: (subIndex: number) => void;
  nestedIndex: number | null;
  index: number;
  locationName: string;
}) => {
  const { icon: Icon, title } = childItem;
  const { isRtl } = useThemeStore();
  
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
    <div>
      {childItem?.nested ? (
        <div
          className={cn("flex items-center gap-3 px-[10px] py-3 rounded-md ", {
            "bg-primary  text-primary-foreground": nestedIndex === index,
            "  text-default-600": nestedIndex !== index,
          })}
        >
          <div
            className={cn(
              "flex  font-medium  text-sm capitalize  gap-3 cursor-pointer flex-1 "
            )}
            onClick={() => toggleNested(index)}
          >
            <span className="inline-flex items-center  flex-grow-0">
              {renderIcon("h-5 w-5")}
            </span>
            <span className="flex-grow truncate">
              {title}
            </span>
          </div>
          {childItem.nested && (
            <div
              className={cn(
                "flex-none transition-all duration-200 text-default-500 ",
                {
                  " transform rotate-90   text-primary-foreground":
                    nestedIndex === index,
                }
              )}
            >
              {isRtl ? (
                <ChevronLeft className="w-3.5 h-3.5 " />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 " />
              )}
            </div>
          )}
        </div>
      ) : (
        <div className=" flex-1">
          <NavLink
            childItem={childItem}
            locationName={locationName}
          />
        </div>
      )}
    </div>
  );
};

export default MenuItem;
