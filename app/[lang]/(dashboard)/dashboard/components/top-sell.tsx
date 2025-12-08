"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import DashboardDropdown from "@/components/dashboard-dropdown";
import { StaticImageData } from "next/image";

import img1 from "@/public/images/home/img-1.png";
import img2 from "@/public/images/home/img-2.png";
import img3 from "@/public/images/home/img-3.png";
import img4 from "@/public/images/home/img-4.png";
import img5 from "@/public/images/home/img-5.png";
import img6 from "@/public/images/home/img-6.png";
import TableList from "../../../../../components/Tables/table-list";

type DataItem = {
  id: number;
  name: string;
  price: string;
  totalsales: string;
  image: StaticImageData;
};

const data: DataItem[] = [
  { id: 1, name: "Apple red watch", price: "369.36", totalsales: "936", image: img1 },
  { id: 2, name: "Samsung Galaxy Buds", price: "249.99", totalsales: "825", image: img2 },
  { id: 3, name: "Sony Headphones", price: "199.99", totalsales: "760", image: img3 },
  { id: 4, name: "Apple AirPods Pro", price: "279.00", totalsales: "705", image: img4 },
  { id: 5, name: "Beats Studio 3", price: "349.99", totalsales: "653", image: img5 },
  { id: 6, name: "Fitbit Versa 4", price: "229.00", totalsales: "640", image: img6 },
  { id: 7, name: "Garmin Smartwatch", price: "499.00", totalsales: "612", image: img4 },
  { id: 8, name: "Bose QC 45", price: "329.00", totalsales: "590", image: img5 },
  { id: 9, name: "OnePlus Buds 2", price: "159.00", totalsales: "540", image: img6 },
  { id: 10, name: "Apple Watch SE", price: "279.00", totalsales: "520", image: img3 },
  { id: 11, name: "Xiaomi Smart Band", price: "49.00", totalsales: "480", image: img2 },
];

const TopSell = () => {
  return (
    <Card>
      {/* --- Header --- */}
      <CardHeader className="border-none flex-row mb-0">
        <div className="flex-1 pt-2">
          <CardTitle>Top Selling Products</CardTitle>
          <span className="block text-sm text-default-600 mt-2">
            Total {data.length} items
          </span>
        </div>
        <DashboardDropdown />
      </CardHeader>

      {/* --- TableList --- */}
      <CardContent className="p-0 pb-4">
        <div className="h-[495px]">
          <ScrollArea className="h-full">
            <TableList
              data={data.map((item) => ({
                id: item.id,
                image: item.image.src,
                title: item.name,
                subtitle: `$${item.price}`,
                value: `${item.totalsales} sales`,
                link: "#",
              }))}
              hoverEffect
            />
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};

export default TopSell;
