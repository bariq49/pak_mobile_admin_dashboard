"use client";

import DashboardDropdown from "@/components/dashboard-dropdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

import img1 from "@/public/images/avatar/avatar-7.jpg";
import img2 from "@/public/images/avatar/avatar-2.jpg";
import img3 from "@/public/images/avatar/avatar-3.jpg";
import img4 from "@/public/images/avatar/avatar-4.jpg";
import img5 from "@/public/images/avatar/avatar-5.jpg";
import img6 from "@/public/images/avatar/avatar-6.jpg";
import { StaticImageData } from "next/image";
import TableList from "../../../../../components/Tables/table-list";

type DataItem = {
  id: number;
  name: string;
  customerId: string;
  amount: string;
  image: StaticImageData;
};

const data: DataItem[] = [
  { id: 1, name: "Chester Bass", customerId: "#546936", amount: "8863", image: img1 },
  { id: 2, name: "Eleanor Pena", customerId: "#546937", amount: "7650", image: img2 },
  { id: 3, name: "Theresa Webb", customerId: "#546938", amount: "6500", image: img3 },
  { id: 4, name: "Marvin McKinney", customerId: "#546939", amount: "4300", image: img4 },
  { id: 5, name: "Leslie Alexander", customerId: "#546940", amount: "9800", image: img5 },
  { id: 6, name: "Guy Hawkins", customerId: "#546941", amount: "1240", image: img6 },
  { id: 7, name: "Courtney Henry", customerId: "#546942", amount: "2450", image: img4 },
  { id: 8, name: "Darrell Steward", customerId: "#546943", amount: "5200", image: img5 },
  { id: 9, name: "Devon Lane", customerId: "#546944", amount: "3400", image: img6 },
  { id: 10, name: "Kathryn Murphy", customerId: "#546945", amount: "7800", image: img4 },
  { id: 11, name: "Ralph Edwards", customerId: "#546946", amount: "6200", image: img5 },
  { id: 12, name: "Arlene McCoy", customerId: "#546947", amount: "9100", image: img6 },
];

const Transactions = () => {
  return (
    <Card>
      {/* --- Header --- */}
      <CardHeader className="border-none flex-row mb-0">
        <div className="flex-1 pt-2">
          <CardTitle>Recent Transactions</CardTitle>
          <span className="block text-sm text-default-600 mt-2">
            Total {data.length} transactions
          </span>
        </div>
        <DashboardDropdown />
      </CardHeader>

      {/* --- TableList --- */}
      <CardContent className="p-0 pb-4">
        <div className="h-[545px]">
          <ScrollArea className="h-full">
            <TableList
              data={data.map((item) => ({
                id: item.id,
                image: item.image.src,
                title: item.name,
                subtitle: item.customerId,
                value: `$${item.amount}`,
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

export default Transactions;
