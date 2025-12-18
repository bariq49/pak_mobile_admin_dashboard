"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface OrderFiltersProps {
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function OrderFilters({
  statusFilter,
  onStatusFilterChange,
  searchQuery,
  onSearchChange,
}: OrderFiltersProps) {
  const statusOptions = [
    { value: "all", label: "All Orders" },
    { value: "pending", label: "Pending" },
    { value: "processing", label: "Processing" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Search */}
        <div>
          <Label htmlFor="search">Search Orders</Label>
          <Input
            id="search"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Order number, customer name, email..."
            className="mt-2"
          />
        </div>

        {/* Status Filter */}
        <div>
          <Label htmlFor="status">Filter by Status</Label>
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger id="status" className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}


