"use client";

import { Row } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Eye } from "lucide-react";
import { Link } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  // const task = taskSchema.parse(row.original)
  const nilai = row.original?.nilai;
  const id = row.original?.id;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          <MoreHorizontal />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <Link to={`/app/${id}`}>
          {nilai ? (
            <DropdownMenuItem>
              <Eye /> View
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem>
              <Pencil /> Edit
            </DropdownMenuItem>
          )}
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
