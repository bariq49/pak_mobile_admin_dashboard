"use client";

import Image from "next/image";
import Link from "next/link";

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
        <div
          key={`table-item-${index}`}
          className={`px-4 py-1 flex gap-3 items-center mb-1.5 ${
            hoverEffect ? "hover:bg-default-50" : ""
          } ${showBorder ? "border-b border-default-200 dark:border-default-700" : ""}`}
        >
          <div className="w-11 h-11 rounded-md flex-none bg-default-100 dark:bg-default-200">
            <Image
              src={item.image}
              alt="product image"
              className="w-full h-full object-cover rounded-md"
              priority
              width={44}
              height={44}
            />
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
      ))}
    </div>
  );
};

export default TableList;