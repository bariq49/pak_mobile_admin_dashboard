"use client";

import {
  ChevronsLeft,
  ChevronsRight,
  ChevronRight,
  ChevronLeft,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table } from "@tanstack/react-table";
import * as React from "react";

interface DataTablePaginationProps {
  table: Table<any>;
  totalRows?: number;
  loading?: boolean;
  fetching?: boolean;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  currentPage?: number;
  totalPages?: number;
}

export function DataTablePagination({
  table,
  totalRows,
  loading,
  fetching = false,
  onPageChange,
  onPageSizeChange,
  currentPage = 1,
  totalPages = 1,
}: DataTablePaginationProps) {
  const pageSize = table.getState().pagination.pageSize;
  const startRow = (currentPage - 1) * pageSize + 1;
  const endRow = Math.min(currentPage * pageSize, totalRows || 0);
  const isDisabled = loading || fetching;

  return (
    <div className="flex items-center flex-wrap gap-2 justify-between px-2 py-3">
      <div className="flex-1 text-sm text-muted-foreground whitespace-nowrap">
        {loading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading page...</span>
          </div>
        ) : (
          <>
            Showing{" "}
            <span className="font-medium">
              {startRow}-{endRow}
            </span>{" "}
            of{" "}
            <span className="font-medium">{totalRows}</span> total row
            {totalRows !== 1 && "s"}
          </>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-6 lg:gap-8">
        {/* Rows per page */}
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-muted-foreground whitespace-nowrap">
            Rows per page
          </p>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => {
              const newPageSize = Number(value);
              table.setPageSize(newPageSize);
              onPageSizeChange?.(newPageSize);
            }}
            disabled={isDisabled}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Page Info */}
        <div className="flex w-[110px] items-center justify-center text-sm font-medium text-muted-foreground">
          Page {currentPage} of {totalPages}
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => onPageChange?.(1)}
            disabled={currentPage === 1 || isDisabled}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange?.(currentPage - 1)}
            disabled={currentPage === 1 || isDisabled}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange?.(currentPage + 1)}
            disabled={currentPage >= totalPages || isDisabled}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => onPageChange?.(totalPages)}
            disabled={currentPage >= totalPages || isDisabled}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
