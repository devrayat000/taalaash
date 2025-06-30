// "use client";

// import { ColumnDef } from "@tanstack/react-table";
// import { ArrowUpDown } from "lucide-react";

// import { CellAction } from "./cell-action";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Button } from "@/components/ui/button";
// import { PostTable } from "@/server/post/service";

// export type PostColumn = PostTable;

// export const columns: ColumnDef<PostColumn>[] = [
//   {
//     id: "select",
//     header: ({ table }) => (
//       <Checkbox
//         checked={
//           table.getIsAllPageRowsSelected() ||
//           (table.getIsSomePageRowsSelected() && "indeterminate")
//         }
//         onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
//         aria-label="Select all"
//       />
//     ),
//     cell: ({ row }) => (
//       <Checkbox
//         checked={row.getIsSelected()}
//         onCheckedChange={(value) => row.toggleSelected(!!value)}
//         aria-label="Select row"
//       />
//     ),
//     enableSorting: false,
//     enableHiding: false,
//   },
//   {
//     accessorKey: "text",
//     header: "Question/Text",
//     enableResizing: false,
//     size: 300,
//     maxSize: 350,
//     cell: ({ renderValue }) => (
//       <p className="line-clamp-2 text-ellipsis w-[95%]">
//         {renderValue<string>().slice(0, 75)}
//         <br />
//         {renderValue<string>().slice(75, 150)}
//       </p>
//     ),
//   },
//   {
//     accessorKey: "chapter.name",
//     enableSorting: true,
//     enableColumnFilter: true,
//     header: ({ column }) => {
//       return (
//         <Button
//           variant="ghost"
//           onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
//         >
//           Chapter
//           <ArrowUpDown className="ml-2 h-4 w-4" />
//         </Button>
//       );
//     },
//   },
//   {
//     accessorKey: "book.name",
//     header: ({ column }) => {
//       return (
//         <Button
//           variant="ghost"
//           onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
//         >
//           Book/Author
//           <ArrowUpDown className="ml-2 h-4 w-4" />
//         </Button>
//       );
//     },
//     enableSorting: true,
//     enableColumnFilter: true,
//   },
//   {
//     accessorKey: "subject.name",
//     header: "Subject",
//     enableSorting: true,
//     enableColumnFilter: true,
//   },
//   {
//     accessorKey: "createdAt",
//     header: "Created At",
//     enableSorting: true,
//     cell: ({ renderValue }) => (
//       <time dateTime={renderValue<string>()}>
//         {new Intl.DateTimeFormat(undefined, {
//           // dateStyle: "long",
//           hour12: true,
//           month: "short",
//           day: "2-digit",
//           year: "numeric",
//           hour: "2-digit",
//           minute: "2-digit",
//         }).format(new Date(renderValue<string>()))}
//       </time>
//     ),
//   },
//   {
//     id: "actions",
//     cell: ({ row }) => <CellAction data={row.original} />,
//   },
// ];
