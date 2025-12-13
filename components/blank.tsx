import React from "react";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface BlankProps {
  children: React.ReactNode
  img?: React.ReactNode
  className?: string
}
const Blank = ({ children, img = <ImageIcon className="w-full h-full text-muted-foreground" />, className }: BlankProps) => {
  return (
    <div className={cn("text-center", className)}>
      {img && <div className=" h-[240px] w-[240px] mx-auto">{img}</div>}
      {children}
    </div>
  );
};

export default Blank;
