import { useState } from "react";
import {
	ColumnDef,
	ColumnFiltersState,
	PaginationState,
	RowSelectionState,
	SortingState,
	VisibilityState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { Variants, motion } from "framer-motion";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	ChevronLeftIcon,
	ChevronRightIcon,
	ChevronsLeft,
	ChevronsRight,
	Trash,
} from "lucide-react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./select";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "./alert-dialog";
import { useFormState } from "react-dom";
import { AnimatePresence } from "framer-motion";
import useUrlPagination from "@/hooks/use-url-pagination";
import { useServerTableStore } from "@/providers/server-table-provider";
import { useLocation } from "@tanstack/react-router";

interface IData {
	id: string;
}

interface DataTableProps<TData extends IData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	searchKey: string;
	deleteAction: (state: void, ids: string[]) => Promise<void>;
}

const fade: Variants = {
	hidden: { opacity: 0.5, scale: 0.9 },
	visible: {
		opacity: 1,
		scale: 1,
		transition: {
			type: "spring",
		},
	},
};

export function DataTable<TData extends IData, TValue>({
	columns,
	searchKey,
	deleteAction,
}: DataTableProps<TData, TValue>) {
	const { data, count } = useServerTableStore<TData>();
	const pathname = useLocation().pathname;

	const { page, limit, query, setLimit, setPage } = useUrlPagination();
	const [sorting, setSorting] = useState<SortingState>([]);
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

	const table = useReactTable({
		data,
		columns,
		onSortingChange: setSorting,
		onRowSelectionChange: setRowSelection,
		manualPagination: true,
		manualFiltering: true,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		enableFilters: true,
		getRowId: (row) => row.id,
		rowCount: count,
		state: {
			sorting,
			columnFilters: [{ id: searchKey, value: query }],
			rowSelection,
			pagination: {
				pageIndex: page - 1,
				pageSize: limit,
			},
		},
	});

	const [, deleteSelected, isLoading] = useFormState(deleteAction, void 0);

	const isSelectionMode = Object.keys(rowSelection).length > 0;

	return (
		<div className="space-y-4">
			<div className="flex items-center">
				<form method="get" action={pathname} className="max-w-sm w-full">
					<input type="hidden" name="limit" defaultValue={limit} />
					<Input
						placeholder="Search"
						type="search"
						name="query"
						defaultValue={
							(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""
						}
						className="w-full"
					/>
				</form>
				<div className="flex-1" />
				<AnimatePresence>
					{isSelectionMode && (
						<AlertDialog>
							<AlertDialogTrigger asChild>
								<motion.button
									className={buttonVariants({
										size: "icon",
										variant: "destructive",
									})}
									variants={fade}
									initial="hidden"
									animate="visible"
									exit="hidden"
								>
									<Trash className="h-5 w-5" />
								</motion.button>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
									<AlertDialogDescription>
										This action cannot be undone. This will permanently delete
										your account and remove your data from our servers.
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel>Cancel</AlertDialogCancel>
									<AlertDialogAction
										onClick={() => deleteSelected(Object.keys(rowSelection))}
									>
										Continue
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					)}
				</AnimatePresence>
			</div>
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									return (
										<TableHead key={header.id}>
											{header.isPlaceholder
												? null
												: flexRender(
														header.column.columnDef.header,
														header.getContext(),
													)}
										</TableHead>
									);
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && "selected"}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center"
								>
									No results.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
			<div className="flex items-center justify-between px-2">
				<div className="flex-1 text-sm text-muted-foreground">
					{table.getFilteredSelectedRowModel().rows.length} of{" "}
					{table.getFilteredRowModel().rows.length} row(s) selected.
				</div>
				<div className="flex items-center space-x-6 lg:space-x-8">
					<div className="flex items-center space-x-2">
						<p className="text-sm font-medium">Rows per page</p>
						<Select
							value={`${table.getState().pagination.pageSize}`}
							onValueChange={(value) => {
								// table.setPageSize(Number(value));
								setLimit(parseInt(value));
							}}
						>
							<SelectTrigger className="h-8 w-[70px]">
								<SelectValue
									placeholder={table.getState().pagination.pageSize}
								/>
							</SelectTrigger>
							<SelectContent side="top">
								{[10, 25, 50, 75, 100].map((pageSize) => (
									<SelectItem key={pageSize} value={`${pageSize}`}>
										{pageSize}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="flex w-[100px] items-center justify-center text-sm font-medium">
						Page {table.getState().pagination.pageIndex + 1} of{" "}
						{table.getPageCount()}
					</div>
					<div className="flex items-center space-x-2">
						<Button
							variant="outline"
							className="hidden h-8 w-8 p-0 lg:flex"
							onClick={() => setPage(1)}
							disabled={!table.getCanPreviousPage()}
						>
							<span className="sr-only">Go to first page</span>
							<ChevronsLeft className="h-4 w-4" />
						</Button>
						<Button
							variant="outline"
							className="h-8 w-8 p-0"
							onClick={() => setPage(page - 1)}
							disabled={!table.getCanPreviousPage()}
						>
							<span className="sr-only">Go to previous page</span>
							<ChevronLeftIcon className="h-4 w-4" />
						</Button>
						<Button
							variant="outline"
							className="h-8 w-8 p-0"
							onClick={() => setPage(page + 1)}
							disabled={!table.getCanNextPage()}
						>
							<span className="sr-only">Go to next page</span>
							<ChevronRightIcon className="h-4 w-4" />
						</Button>
						<Button
							variant="outline"
							className="hidden h-8 w-8 p-0 lg:flex"
							onClick={() => setPage(table.getPageCount())}
							disabled={!table.getCanNextPage()}
						>
							<span className="sr-only">Go to last page</span>
							<ChevronsRight className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
