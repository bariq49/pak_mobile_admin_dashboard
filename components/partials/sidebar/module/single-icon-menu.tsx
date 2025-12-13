import React from "react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  TooltipArrow,
} from "@/components/ui/tooltip";
import Link from "next/link";
const SingleIconMenu = ({ index, activeIndex, item, locationName }: {
  index: number;
  activeIndex: number | null;
  item: any;
  locationName: string;
}) => {
  const { icon: Icon, title, href } = item;
  
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
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {href ? (
              <Link
                href={href}
                className={cn(
                  "h-12 w-12 mx-auto rounded-md  transition-all duration-300 flex flex-col items-center justify-center cursor-pointer relative",
                  {
                    "bg-primary/10  text-primary": locationName === href,
                    "text-default-500 dark:text-default-400 hover:bg-primary/10  hover:text-primary ":
                      locationName !== href,
                  }
                )}
              >
                {renderIcon("w-8 h-8")}
              </Link>
            ) : (
              <button
                className={cn(
                  "h-12 w-12 mx-auto rounded-md transition-all duration-300 flex flex-col items-center justify-center cursor-pointer relative  ",
                  {
                    "bg-primary/10 dark:bg-primary dark:text-primary-foreground  text-primary data-[state=delayed-open]:bg-primary/10 ":
                      activeIndex === index,
                    " text-default-500 dark:text-default-400 data-[state=delayed-open]:bg-primary/10  data-[state=delayed-open]:text-primary":
                      activeIndex !== index,
                  }
                )}
              >
                {renderIcon("w-6 h-6")}
              </button>
            )}
          </TooltipTrigger>
          <TooltipContent side="right" className=" capitalize">
            {title}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </>
  );
};

export default SingleIconMenu;
