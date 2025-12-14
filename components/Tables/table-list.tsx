"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface TableListProps {
  data: {
    id: number | string;
    image: string;
    title: string;
    subtitle?: string;
    value?: string;
    link?: string;
  }[];
  showBorder?: boolean;
  hoverEffect?: boolean;
}

const TableList = ({
  data,
  showBorder = false,
  hoverEffect = true,
}: TableListProps) => {
  return (
    <div className="h-full">
      {data.map((item, index) => (
        <TableListItem
          key={`table-item-${item.id || index}`}
          item={item}
          showBorder={showBorder}
          hoverEffect={hoverEffect}
        />
      ))}
    </div>
  );
};

const TableListItem = ({
  item,
  showBorder,
  hoverEffect,
}: {
  item: TableListProps["data"][0];
  showBorder: boolean;
  hoverEffect: boolean;
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageSrc, setImageSrc] = useState(item.image || "");

  const handleImageError = () => {
    if (!imageError) {
      setImageError(true);
      // Fallback to a simple data URI placeholder
      setImageSrc("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='44' height='44'%3E%3Crect fill='%23ddd' width='44' height='44'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999' font-size='14'%3ENo Image%3C/text%3E%3C/svg%3E");
    }
  };

  // Validate image URL
  const isValidImageUrl = (url: string): boolean => {
    if (!url || url.trim() === "") return false;
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === "http:" || urlObj.protocol === "https:" || url.startsWith("data:");
    } catch {
      return url.startsWith("data:") || url.startsWith("/");
    }
  };

  const finalImageSrc = isValidImageUrl(imageSrc) 
    ? imageSrc 
    : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='44' height='44'%3E%3Crect fill='%23ddd' width='44' height='44'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999' font-size='14'%3ENo Image%3C/text%3E%3C/svg%3E";

  return (
    <div
      className={`px-4 py-1 flex gap-3 items-center mb-1.5 ${
        hoverEffect ? "hover:bg-default-50" : ""
      } ${showBorder ? "border-b border-default-200 dark:border-default-700" : ""}`}
    >
      <div className="w-11 h-11 rounded-md flex-none bg-default-100 dark:bg-default-200 overflow-hidden">
        {finalImageSrc.startsWith("data:") || (!finalImageSrc.startsWith("http") && !finalImageSrc.startsWith("/")) ? (
          <img
            src={finalImageSrc}
            alt={item.title || "image"}
            className="w-full h-full object-cover rounded-md"
            onError={handleImageError}
          />
        ) : (
          <Image
            src={finalImageSrc}
            alt={item.title || "image"}
            className="w-full h-full object-cover rounded-md"
            width={44}
            height={44}
            onError={handleImageError}
            unoptimized={finalImageSrc.includes("ui-avatars.com")}
          />
        )}
      </div>
      <div className="flex-1">
        {item.link ? (
          <Link
            href={item.link}
            className="text-sm font-medium text-default-800 hover:text-primary"
          >
            {item.title}
          </Link>
        ) : (
          <span className="text-sm font-medium text-default-800">
            {item.title}
          </span>
        )}
        {item.subtitle && (
          <div className="text-xs text-default-400">{item.subtitle}</div>
        )}
      </div>
      {item.value && (
        <div className="flex-none text-sm font-medium text-default-700">
          {item.value}
        </div>
      )}
    </div>
  );
};

export default TableList;
