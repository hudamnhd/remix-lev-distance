"use client";

import { Table } from "@tanstack/react-table";
import { X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { DataTableViewOptions } from "./data-table-view-options";
import { RequestForm } from "./data-table-header-request";
import { SheetSide } from "./data-table-header-add";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  profile: {
    role: string;
    name: string;
    address: string;
  };
}

export function DataTableToolbar<TData>({
  table,
  profile,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const isAdmin = profile?.role === "Admin";

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Filter data..."
          onChange={(e) => table.setGlobalFilter(String(e.target.value))}
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X />
          </Button>
        )}
      </div>
      <div className="flex  items-center space-x-2">
        {isAdmin ? <SheetSide /> : <RequestForm profile={profile} />}
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}
