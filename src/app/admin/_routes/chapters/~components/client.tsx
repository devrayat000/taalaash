import { Plus } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
// import { ApiList } from "@/components/ui/api-list";

import { columns } from "./columns";
import { deleteManyChaptersFn } from "@/server/chapter/function";
import { useServerTableStore } from "@/providers/server-table-provider";

export const ChaptersClient: React.FC = () => {
	const { count } = useServerTableStore();

	return (
		<>
			<div className="flex items-center justify-between">
				<Heading
					title={`Chapters (${count})`}
					description="Manage chapters for your products"
				/>
				<Button asChild>
					<Link to="/admin/chapters/$chapterId" params={{ chapterId: "new" }}>
						<Plus className="mr-2 h-4 w-4" /> Add New
					</Link>
				</Button>
			</div>
			<Separator />
			<DataTable
				searchKey="name"
				columns={columns}
				deleteAction={deleteManyChaptersFn}
			/>
			<Heading title="API" description="API Calls for Chapters" />
			<Separator />
			{/* <ApiList entityName="chapters" entityIdName="chapterId" /> */}
		</>
	);
};
