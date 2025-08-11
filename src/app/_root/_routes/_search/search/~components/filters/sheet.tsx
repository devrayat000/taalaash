import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { FilterIcon } from "lucide-react";
import FilterClient, { FilterClientProps } from "./client";
import { SearchSchema } from "../searchSchema";
import { useSearch } from "@tanstack/react-router";

export default function FilterSheet({
	initialData,
}: {
	initialData: FilterClientProps["initialData"];
}) {
	const searchParams = useSearch({ from: "/_root/_routes/_search/search/" });
	return (
		<Sheet>
			<SheetTrigger asChild className="lg:hidden">
				<Button
					variant="outline"
					className="w-full flex justify-center gap-x-4"
				>
					<FilterIcon size={24} />
					Filter
				</Button>
			</SheetTrigger>
			<SheetContent className="lg:hidden">
				<div className="space-y-4">
					<SheetHeader>
						<SheetTitle>Filter</SheetTitle>
					</SheetHeader>
					<div>
						<input type="hidden" name="query" value={searchParams.query} />
						{searchParams?.page && (
							<input type="hidden" name="page" value={searchParams?.page} />
						)}

						<div>
							<FilterClient initialData={initialData} />
						</div>
					</div>
					<SheetFooter className="mt-4">
						<SheetClose asChild>
							<Button type="submit">Save changes</Button>
						</SheetClose>
					</SheetFooter>
				</div>
			</SheetContent>
		</Sheet>
	);
}
