import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Calendar, BarChart, ShoppingBag, Building, MessageCircle, Mail, User, Menu, Check, Megaphone, FileText, Table, ClipboardList } from "lucide-react";
const HeaderSearch = ({ open, setOpen }: { open: boolean; setOpen: any }) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent size="xl" className="p-0 " hiddenCloseIcon>
        <Command>
          <div className="flex items-center border-b border-default-200">
            <CommandInput
              placeholder=""
              className="h-14"
              inputWrapper="px-3.5 flex-1 border-none"
            />
            <div className="flex-none flex items-center justify-center gap-1 pr-4">
              <span className="text-sm text-default-500 font-normal select-none">
                [esc]
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-transparent text-xs hover:text-default-800 px-1"
                onClick={() => setOpen(false)}
              >
                {" "}
                <X className="w-5 h-5 text-default-500" />
              </Button>
            </div>
          </div>
          <CommandList className="py-5 px-7 max-h-[500px]">
            <CommandEmpty>No results found.</CommandEmpty>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <CommandGroup
                heading="Populer Searches"
                className="[&_[cmdk-group-heading]]:text-sm [&_[cmdk-group-heading]]:font-normal [&_[cmdk-group-heading]]:text-default-400 [&_[cmdk-group-heading]]:mb-2.5
                [&_[cmdk-group-heading]]:uppercase    [&_[cmdk-group-heading]]:tracking-widest
                "
              >
                <CommandItem className="aria-selected:bg-transparent p-0 mb-2.5">
                  <Link
                    href="/calendar-page"
                    className="flex gap-1 items-center px-2 text-default-500 hover:text-primary "
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Calendar</span>
                  </Link>
                </CommandItem>
                <CommandItem className="aria-selected:bg-transparent p-0 mb-2.5">
                  <Link
                    href="/dashboard"
                    className="flex gap-1 items-center px-2 text-default-500 hover:text-primary "
                  >
                    <BarChart className="w-4 h-4" />
                    <span>Analytics</span>
                  </Link>
                </CommandItem>
                <CommandItem className="aria-selected:bg-transparent p-0 mb-2.5">
                  <Link
                    href="/ecommerce"
                    className="flex gap-1 items-center px-2 text-default-500 hover:text-primary "
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>eCommerce</span>
                  </Link>
                </CommandItem>
                <CommandItem className="aria-selected:bg-transparent p-0 ">
                  <Link
                    href="/project"
                    className="flex gap-1 items-center px-2 text-default-500 hover:text-primary "
                  >
                    <Building className="w-4 h-4" />
                    <span>Project Page</span>
                  </Link>
                </CommandItem>
              </CommandGroup>
              <CommandGroup
                heading="Apps & Pages"
                className="[&_[cmdk-group-heading]]:text-sm [&_[cmdk-group-heading]]:font-normal [&_[cmdk-group-heading]]:text-default-400 [&_[cmdk-group-heading]]:mb-2.5
                [&_[cmdk-group-heading]]:uppercase    [&_[cmdk-group-heading]]:tracking-widest
                "
              >
                <CommandItem className="aria-selected:bg-transparent p-0 mb-2.5">
                  <Link
                    href="/chat"
                    className="flex gap-1 items-center px-2 text-default-500 hover:text-primary "
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Chat</span>
                  </Link>
                </CommandItem>
                <CommandItem className="aria-selected:bg-transparent p-0 mb-2.5">
                  <Link
                    href="/email"
                    className="flex gap-1 items-center px-2 text-default-500 hover:text-primary "
                  >
                    <Mail className="w-4 h-4" />
                    <span>Email</span>
                  </Link>
                </CommandItem>
                <CommandItem className="aria-selected:bg-transparent p-0 mb-2.5">
                  <Link
                    href="/dashboard"
                    className="flex gap-1 items-center px-2 text-default-500 hover:text-primary "
                  >
                    <User className="w-4 h-4" />
                    <span>Sign In</span>
                  </Link>
                </CommandItem>
                <CommandItem className="aria-selected:bg-transparent p-0">
                  <Link
                    href="/calendar-page"
                    className="flex gap-1 items-center px-2 text-default-500 hover:text-primary "
                  >
                    <BarChart className="w-4 h-4" />
                    <span>Appex Chart</span>
                  </Link>
                </CommandItem>
              </CommandGroup>
              <CommandGroup
                heading="UI Elements"
                className="[&_[cmdk-group-heading]]:text-sm [&_[cmdk-group-heading]]:font-normal [&_[cmdk-group-heading]]:text-default-400 [&_[cmdk-group-heading]]:mb-2.5
                [&_[cmdk-group-heading]]:uppercase    [&_[cmdk-group-heading]]:tracking-widest"
              >
                <CommandItem className="aria-selected:bg-transparent p-0 mb-2.5">
                  <Link
                    href="/accordion"
                    className="flex gap-1 items-center px-2 text-default-500 hover:text-primary "
                  >
                    <Menu className="w-4 h-4" />
                    <span>Accordion</span>
                  </Link>
                </CommandItem>
                <CommandItem className="aria-selected:bg-transparent p-0 mb-1">
                  <Link
                    href="/checkbox"
                    className="flex gap-1 items-center px-2 text-default-500 hover:text-primary "
                  >
                    <Check className="w-4 h-4" />
                    <span>Checkboxes</span>
                  </Link>
                </CommandItem>
                <CommandItem className="aria-selected:bg-transparent p-0 mb-1">
                  <Link
                    href="/alert"
                    className="flex gap-1 items-center px-2 text-default-500 hover:text-primary "
                  >
                    <Megaphone className="w-4 h-4" />
                    <span>Alert</span>
                  </Link>
                </CommandItem>
                <CommandItem className="aria-selected:bg-transparent p-0 mb-1">
                  <Link
                    href="/pagination"
                    className="flex gap-1 items-center px-2 text-default-500 hover:text-primary "
                  >
                    <FileText className="w-4 h-4" />
                    <span>Pagination</span>
                  </Link>
                </CommandItem>
              </CommandGroup>
              <CommandGroup
                heading="Forms & Tables"
                className="[&_[cmdk-group-heading]]:text-sm [&_[cmdk-group-heading]]:font-normal [&_[cmdk-group-heading]]:text-default-400 [&_[cmdk-group-heading]]:mb-2.5
                [&_[cmdk-group-heading]]:uppercase    [&_[cmdk-group-heading]]:tracking-widest"
              >
                <CommandItem className="aria-selected:bg-transparent p-0 mb-2.5">
                  <Link
                    href="/simple-table"
                    className="flex gap-1 items-center px-2 text-default-500 hover:text-primary "
                  >
                    <Table className="w-4 h-4" />
                    <span>Simple Table</span>
                  </Link>
                </CommandItem>
                <CommandItem className="aria-selected:bg-transparent p-0 mb-2.5">
                  <Link
                    href="/tailwindui-table"
                    className="flex gap-1 items-center px-2 text-default-500 hover:text-primary "
                  >
                    <Table className="w-4 h-4" />
                    <span>Tailwind Ui Table</span>
                  </Link>
                </CommandItem>
                <CommandItem className="aria-selected:bg-transparent p-0 mb-2.5">
                  <Link
                    href="/data-table"
                    className="flex gap-1 items-center px-2 text-default-500 hover:text-primary "
                  >
                    <Table className="w-4 h-4" />
                    <span>Tanstack Table</span>
                  </Link>
                </CommandItem>
                <CommandItem className="aria-selected:bg-transparent p-0">
                  <Link
                    href="/calendar-page"
                    className="flex gap-1 items-center px-2 text-default-500 hover:text-primary "
                  >
                    <ClipboardList className="w-4 h-4" />
                    <span>Forms</span>
                  </Link>
                </CommandItem>
              </CommandGroup>
            </div>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
};

export default HeaderSearch;
