"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { DataTablePagination } from "./data-table-pagination";
import { DataTableToolbar } from "./data-table-toolbar";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  filterColumns?: {
    column: string;
    title: string;
    multiple: boolean;
    options: {
      label: string;
      value: string;
      icon?: React.ComponentType<{ className?: string }>;
    }[];
  }[];
  loading?: boolean;
  fetching?: boolean;
  error?: string | null;
  pagination?: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey = "name",
  filterColumns = [],
  loading = false,
  fetching = false,
  error = null,
  pagination,
  onPageChange,
  onPageSizeChange,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    pageCount: pagination?.pages ?? 1,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  const handlePageChange = (page: number) => {
    onPageChange?.(page);
  };
  const handlePageSizeChange = (pageSize: number) => {
    onPageSizeChange?.(pageSize);
  };

  return (
    <div className="space-y-4">
      <DataTableToolbar
        table={table}
        searchKey={searchKey}
        filterColumns={filterColumns}
      />

      <div className="relative rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                    <Loader2 className="mb-2 h-5 w-5 animate-spin" />
                    Loading data...
                  </div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <div className="flex items-center justify-center py-10 text-red-500 font-medium">
                    {error}
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <div className="flex items-center justify-center py-10 text-muted-foreground">
                    No results found.
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <AnimatePresence>
          {fetching && !loading && (
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex items-center justify-center
                         bg-white/60 dark:bg-black/40 backdrop-blur-[1px]"
            >
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <DataTablePagination
        table={table}
        totalRows={pagination?.total}
        loading={loading}
        fetching={fetching}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        currentPage={pagination?.page ?? 1}
        totalPages={pagination?.pages ?? 1}
      />
    </div>
  );
}
