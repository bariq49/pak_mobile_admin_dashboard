import React from "react";

import { Badge } from "@/components/ui/badge";
import { cn, isLocationMatch } from "@/lib/utils";
import { usePathname } from "next/navigation";
import Link from "next/link";

const SingleMenuItem = ({ item, collapsed }: {
  item: any;
  collapsed: boolean
}) => {
  const { badge, href, title, icon: Icon } = item;
  const locationName = usePathname();
  
  // Handle icon - it might be a component or an object with default
  // Check if it's a function (React component) or has a default property
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
    <Link href={href}>
      <>
        {collapsed ? (
          <div>
            <span
              className={cn(
                "h-12 w-12 mx-auto rounded-md  transition-all duration-300 inline-flex flex-col items-center justify-center  relative  ",
                {
                  "bg-primary text-primary-foreground ": isLocationMatch(
                    href,
                    locationName
                  ),
                  " text-default-600  ": !isLocationMatch(href, locationName),
                }
              )}
            >
              {renderIcon("w-6 h-6")}
            </span>
          </div>
        ) : (
          <div
            className={cn(
              "flex gap-3  text-default-700 text-sm capitalize px-[10px] py-3 rounded cursor-pointer hover:bg-primary hover:text-primary-foreground",
              {
                "bg-primary text-primary-foreground": isLocationMatch(
                  href,
                  locationName
                ),
              }
            )}
          >
            <span className="flex-grow-0">
              {renderIcon("w-5 h-5")}
            </span>
            <div className="text-box flex-grow">{title}</div>
            {badge && <Badge className=" rounded">{item.badge}</Badge>}
          </div>
        )}
      </>
    </Link>
  );
};

export default SingleMenuItem;
