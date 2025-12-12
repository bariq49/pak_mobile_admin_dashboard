"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import type { Period } from "@/api/dashboard/dashboard.api";

interface DashboardSelectProps {
  value?: Period;
  onValueChange?: (value: Period) => void;
  defaultValue?: Period;
}

const DashboardSelect = ({ value, onValueChange, defaultValue = "30days" }: DashboardSelectProps) => {
  return (
    <Select value={value} onValueChange={onValueChange} defaultValue={defaultValue}>
      <SelectTrigger className="w-[124px]">
        <SelectValue placeholder="Select Period" className="whitespace-nowrap" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="30days">Last 30 Days</SelectItem>
        <SelectItem value="12months">Last 12 Months</SelectItem>
        <SelectItem value="custom">Custom Range</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default DashboardSelect;