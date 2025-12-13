"use client";
import React from "react";
import { useThemeStore } from "@/store";

const DirectionProvider = ({ children }: { children: React.ReactNode }) => {
  const { isRtl } = useThemeStore();

  const direction = isRtl ? "rtl" : "ltr";

  return (
    <div dir={direction}>
      {children}
    </div>
  );
};

export default DirectionProvider;
