"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";

import { labels, priorities, statuses } from "../data/data";
import { Task } from "../data/schema";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";

function parseDate(dateString) {
  const date = new Date(dateString);

  // Opsi untuk memformat tanggal
  const options = {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "long",
    year: "numeric",
  };

  // Format menjadi HH:MM, DD Month Year
  return date.toLocaleString("id-ID", options).replace(",", "");
}

export const columns: ColumnDef<Task>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "no",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} className="w-[10px]" title="No" />
    ),
    cell: ({ row }) => <div className="w-[10px]">{row.getValue("no")}</div>,
  },
  {
    accessorKey: "address",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Address" />
    ),
    cell: ({ row }) => <div>{row.getValue("address")}</div>,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nama" />
    ),
    cell: ({ row }) => <div>{row.getValue("name")}</div>,
  },
  {
    accessorKey: "mataKuliah",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mata Kuliah" />
    ),
    cell: ({ row }) => (
      <Badge variant="outline" className="text-sm font-bold rounded-md">
        {row.getValue("mataKuliah")}
      </Badge>
    ),
  },
  {
    accessorKey: "jenisMagang",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Jenis Magang" />
    ),
    cell: ({ row }) => (
      <Badge variant="outline" className="text-sm font-bold rounded-md">
        {row.getValue("jenisMagang")}
      </Badge>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => (
      <div>
        <StatusRequest md={row.original} />
      </div>
    ),

    enableSorting: false,
    enableHiding: true,
  },
  {
    accessorKey: "tanggal",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tanggal Pengajuan" />
    ),
    cell: ({ row }) => <div>{parseDate(row.getValue("tanggal"))}</div>,
  },
  {
    accessorKey: "nilai",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nilai" />
    ),
    cell: ({ row }) => (
      <div>
        <PopoverNilai nilai={row.original?.nilai} />
      </div>
    ),
    enableSorting: false,
    enableHiding: true,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const nilai = row.original?.nilai;
      const laporanMagang = row.original?.laporanMagang;
      const isAdmin = row.original?.isAdmin;
      if (isAdmin && nilai) {
        return null;
      } else if (!isAdmin && laporanMagang && !nilai) {
        return null;
      } else {
        return <DataTableRowActions row={row} />;
      }
    },
  },
];

const BadgeStatus = ({
  bg,
  text,
  content,
}: { content: string; bg: string; text?: string }) => {
  return (
    <span
      className={`text-sm font-semibold inline-flex items-center justify-center rounded-md  px-2.5 py-0.5 ${bg} ${text}`}
    >
      {content}
    </span>
  );
};

const StatusRequest = ({ md }) => {
  return (
    <>
      {md?.tanggalSidang ? (
        <BadgeStatus
          content="Selesai"
          bg="bg-green-100"
          text="text-green-800"
        />
      ) : md?.laporanMagang ? (
        <BadgeStatus content="Menunggu Sidang" bg="bg-sky-100" />
      ) : md?.rancangKRS && !md.validasiDekan ? (
        <BadgeStatus
          content="Menunggu Validasi Dekan & Kaprodi"
          bg="bg-slate-100"
          text="text-slate-700"
        />
      ) : md?.validasiDekan ? (
        <BadgeStatus
          content="Proses Magang"
          bg="bg-indigo-100"
          text="text-indigo-700"
        />
      ) : md?.status === 1 ? (
        <BadgeStatus
          content="Menunggu Disetujui"
          bg="bg-amber-100"
          text="text-amber-700"
        />
      ) : md?.status === 2 ? (
        <BadgeStatus
          content="Disetujui"
          bg="bg-emerald-100"
          text="text-emerald-7-00"
        />
      ) : (
        <BadgeStatus
          content="Tidak Lolos"
          bg="bg-red-100"
          text="text-red-700"
        />
      )}
    </>
  );
};

import { CircleHelp } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

import React from "react";
import { konversiNilai } from "~/lib/fuzzy";
import { Button } from "~/components/ui/button";

function PopoverNilai({ nilai }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm">
          <CircleHelp className="h-4 w-4" />
          <span className="sr-only">Toggle</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="text-sm p-1.5 w-fit space-y-1" side="left">
        {nilai && <Label className="p-2">Detail Nilai</Label>}
        {nilai ? (
          nilai?.map((person, index) => (
            <div
              key={index}
              className={`cursor-pointer flex items-center justify-between gap-x-2 ${
                person.category === 1
                  ? "bg-yellow-50"
                  : person.category === 2
                    ? "bg-blue-50"
                    : person.category === 3
                      ? "bg-green-50"
                      : person.category === 4
                        ? "bg-red-50"
                        : ""
              }`}
            >
              <div className="px-4 py-2 font-medium text-gray-900 text-left  truncate">
                {person.matakuliah}
              </div>
              <div className="px-6 py-2 font-bold text-gray-900 text-left">
                {person?.score === null ? (
                  "-"
                ) : (
                  <Badge
                    className="text-sm rounded-md border-gray-400"
                    variant="outline"
                  >
                    {konversiNilai(person?.score)}
                  </Badge>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-center">Belum ada nilai</p>
        )}
      </PopoverContent>
    </Popover>
  );
}
