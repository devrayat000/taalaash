import FilterClient, { FilterClientProps } from "./client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSearch } from "@tanstack/react-router";
import { SlidersHorizontal } from "lucide-react";

export default function FilterSidebar({
	initialData,
}: {
	initialData: FilterClientProps["initialData"];
}) {
	const searchParams = useSearch({ from: "/_root/_routes/_search/search/" });

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-lg">
					<SlidersHorizontal className="h-5 w-5 text-[#00B894]" />
					Filters
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					<input type="hidden" name="query" value={searchParams.query} />
					{searchParams?.page && (
						<input type="hidden" name="page" value={searchParams?.page} />
					)}

					<div className="space-y-4">
						<FilterClient initialData={initialData} />
					</div>

					<Button
						type="submit"
						className="w-full bg-[#00B894] hover:bg-[#00B894]/90"
					>
						Apply Filters
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
