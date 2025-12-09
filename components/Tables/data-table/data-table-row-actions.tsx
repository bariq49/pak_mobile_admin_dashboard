"use client";

import * as React from "react";
import { MoreHorizontal } from "lucide-react";
import { Row } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { toast } from "sonner";
import { ProductDetails } from "@/components/product-details";
import { Product } from "@/api/product/products.api";

interface LabelOption {
  label: string;
  value: string;
}

interface RowAction<TData> {
  label: string;
  onClick?: (row: TData) => void | Promise<void>;
  shortcut?: string;
  icon?: React.ReactNode;
  destructive?: boolean;
  confirm?: boolean;
  subMenu?: {
    title: string;
    options: LabelOption[];
    valueKey?: string;
  };
  openModal?: boolean;
  successMessage?: string;
}

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
  actions: RowAction<TData>[];
}
export function DataTableRowActions<TData>({
  row,
  actions,
}: DataTableRowActionsProps<TData>) {
  const item = row.original;
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const [pendingAction, setPendingAction] = React.useState<RowAction<TData> | null>(null);

  const handleAction = async (action: RowAction<TData>) => {
    if (action.openModal) {
      setDetailsOpen(true);
      return;
    }

    if (action.confirm && action.destructive) {
      setPendingAction(action);
      setConfirmOpen(true);
      return;
    }

    await action.onClick?.(item);
    if (action.successMessage) toast.success(action.successMessage);
  };

  const handleConfirm = async () => {
    if (pendingAction) {
      await pendingAction.onClick?.(item);
      if (pendingAction.successMessage) toast.success(pendingAction.successMessage);
      setPendingAction(null);
    }
    setConfirmOpen(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-[150px]">
          {actions.map((action, index) =>
            action.subMenu ? (
              <DropdownMenuSub key={index}>
                <DropdownMenuSubTrigger>{action.subMenu.title}</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup
                    value={
                      (item as any)[action.subMenu.valueKey || action.subMenu.title] || ""
                    }
                  >
                    {action.subMenu.options.map((option) => (
                      <DropdownMenuRadioItem
                        key={option.value}
                        value={option.value}
                        onClick={() => toast.info(`Set ${option.label}`)}
                      >
                        {option.label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            ) : (
              <DropdownMenuItem
              key={index}
              onClick={() => handleAction(action)}
              className={`
                flex items-center justify-between
                ${action.destructive ? "text-destructive focus:text-destructive" : ""}
              `}
            >
              <span>{action.label}</span>
              <span className="w-4 flex justify-end">{action.icon}</span>
            </DropdownMenuItem>
            
            )
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Confirm Delete */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this item? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Details Modal */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {(() => {
                const itemObj = item as any;
                return (itemObj?.name && typeof itemObj.name === 'string')
                  ? `${itemObj.name} - Details`
                  : 'Product Details';
              })()}
            </DialogTitle>
            <DialogDescription>
              {(() => {
                const itemObj = item as any;
                return (itemObj?.name && typeof itemObj.name === 'string')
                  ? `Complete information about ${itemObj.name}`
                  : 'View complete product information';
              })()}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {/* Check if item is a Product and render ProductDetails component */}
            {(() => {
              const itemObj = item as any;
              // Check if it looks like a Product (has name and price properties)
              if (itemObj && typeof itemObj === 'object' && 'name' in itemObj && 'price' in itemObj) {
                return <ProductDetails product={itemObj as Product} />;
              }
              // Fallback to generic display
              return (
                <div className="space-y-2 text-sm">
                  {Object.entries(itemObj as Record<string, any>).map(([key, value]) => (
                    <div key={key} className="flex justify-between border-b py-1">
                      <span className="font-medium capitalize">{key}</span>
                      <span>{String(value)}</span>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
