"use client";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "./data-table-view-options";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { Table } from "@tanstack/react-table";

interface DataTableToolbarProps {
  table: Table<any>;
  searchKey: string;
  filterColumns?: {
    multiple: boolean;
    column: string;
    title: string;
    options: { label: string; value: string; icon?: React.ComponentType<{ className?: string }> }[];
  }[];
}

export function DataTableToolbar({ 
  table, 
  searchKey, 
  filterColumns = [], 
}: DataTableToolbarProps) {
  const isFiltered = table.getState().columnFilters.length > 0;
  
  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    table.getColumn(searchKey)?.setFilterValue(value);
  };

  return (
    <div className="flex flex-1 flex-wrap items-center gap-2">
      <Input
        placeholder={`Filter by ${searchKey}...`}
        value={table.getColumn(searchKey)?.getFilterValue() as string || ""}
        onChange={handleFilterChange}
        className="h-10 min-w-[200px] max-w-sm"
      />

      {filterColumns.map((filter) => {
        const column = table.getColumn(filter.column);
        return column ? (
          <DataTableFacetedFilter
            key={filter.column}
            column={column}
            title={filter.title}
            options={filter.options}
            multiple={filter.multiple ?? false}
          />
        ) : null;
      })}
      {isFiltered && (
        <Button
          variant="outline"
          onClick={() => table.resetColumnFilters()}
          className="h-10 px-2 lg:px-3"
        >
          Reset
          <X className="ltr:ml-2 rtl:mr-2 h-4 w-4" />
        </Button>
      )}
      <DataTableViewOptions table={table} />

      
    </div>
  );
}