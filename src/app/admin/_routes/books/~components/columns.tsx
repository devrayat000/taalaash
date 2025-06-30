"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Check, X } from "lucide-react";

import { CellAction } from "./cell-action";
import { Checkbox } from "@/components/ui/checkbox";

export type BookColumn = {
  id: string;
  name: string;
  subject: {
    id: string;
    name: string;
  };
};

export const columns: ColumnDef<BookColumn>[] = [
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
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "edition",
    header: "Edition",
  },
  {
    accessorKey: "marked",
    header: "Marked",
    cell: ({ getValue }) =>
      getValue<boolean>() ? (
        <Check className="w-5 h-5 text-green-600" />
      ) : (
        <X className="w-5 h-5 text-red-600" />
      ),
  },
  {
    accessorKey: "subject.name",
    header: "Subject",
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
