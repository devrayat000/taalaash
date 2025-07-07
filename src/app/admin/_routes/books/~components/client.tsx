import { Plus } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
// import { ApiList } from "@/components/ui/api-list";

import { columns } from "./columns";
import { deleteManyBooks } from "@/server/book/action/book";
import { useServerTableStore } from "@/providers/server-table-provider";

export const BooksClient: React.FC = () => {
	const { count } = useServerTableStore();

	return (
		<>
			<div className="flex items-center justify-between">
				<Heading
					title={`Books (${count})`}
					description="Manage books for your products"
				/>
				<Button asChild>
					<Link to="/admin/books/$bookId" params={{ bookId: "new" }}>
						<Plus className="mr-2 h-4 w-4" /> Add New
					</Link>
				</Button>
			</div>
			<Separator />
			<DataTable
				searchKey="name"
				columns={columns}
				deleteAction={deleteManyBooks}
			/>
			<Heading title="API" description="API Calls for Books" />
			<Separator />
			{/* <ApiList entityName="books" entityIdName="bookId" /> */}
		</>
	);
};
