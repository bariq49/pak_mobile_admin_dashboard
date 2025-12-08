"use client";

import * as React from "react";
import { Check, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Column } from "@tanstack/react-table";

interface Option {
  value: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface DataTableFacetedFilterProps {
  column: Column<any, any>;
  title: string;
  options: Option[];
  multiple?: boolean;
}

export function DataTableFacetedFilter({
  column,
  title,
  options,
  multiple = false,
}: DataTableFacetedFilterProps) {
  const facets = column?.getFacetedUniqueValues();
  const filterValue = column?.getFilterValue() as string[] | undefined;
  const selectedValues = new Set(filterValue);

  const handleSelect = (value: string, isSelected: boolean) => {
    if (multiple) {
      if (isSelected) selectedValues.delete(value);
      else selectedValues.add(value);
      const filterValues = Array.from(selectedValues);
      column?.setFilterValue(filterValues.length ? filterValues : undefined);
    } else {
      const newValue = isSelected ? undefined : value;
      column?.setFilterValue(newValue ? [newValue] : undefined);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-10 px-3 text-sm font-medium flex items-center rounded-lg border-primary transition-colors"
        >
          <Filter className="mr-2 h-4 w-4" />
          {title}

          {selectedValues.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              {/* Mobile count badge */}
              <Badge
                color="secondary"
                className="rounded-sm px-1 font-normal lg:hidden"
              >
                {selectedValues.size}
              </Badge>

              {/* Desktop labels */}
              <div className="hidden space-x-1 rtl:space-x-reverse lg:flex">
                {selectedValues.size > 2 ? (
                  <Badge
                    color="secondary"
                    className="rounded-sm px-2 font-normal"
                  >
                    {selectedValues.size} selected
                  </Badge>
                ) : (
                  options
                    .filter((option) => selectedValues.has(option.value))
                    .map((option) => (
                      <Badge
                        color="secondary"
                        key={option.value}
                        className="rounded-sm px-2 font-normal"
                      >
                        {option.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[230px] p-0" align="start">
        <Command>
          <CommandList className="max-h-[260px] overflow-auto">
            <CommandEmpty className="text-center py-2 text-sm text-muted-foreground">
              No options found.
            </CommandEmpty>

            <CommandGroup className="px-1 py-1">
              {options.map((option) => {
                const isSelected = selectedValues.has(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => handleSelect(option.value, isSelected)}
                    className={cn(
                      "flex items-center justify-between rounded-md px-2 py-2 text-sm",
                      "hover:bg-muted/50 focus:bg-muted/50 transition-colors"
                    )}
                  >
                    {/* Left side: label + icon */}
                    <div className="flex items-center gap-2">
                      {option.icon && (
                        <option.icon className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span>{option.label}</span>
                    </div>

                    {/* Right side: clean checkbox */}
                    <div
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-md border transition-all duration-150",
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground shadow-sm"
                          : "border-muted-foreground/40 bg-transparent hover:border-primary/60"
                      )}
                    >
                      <Check
                        className={cn(
                          "h-3.5 w-3.5 transition-opacity duration-150",
                          isSelected ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
