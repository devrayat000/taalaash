import { createFileRoute, useSearch } from "@tanstack/react-router";
import {
	array,
	integer,
	number,
	object,
	optional,
	pipe,
	string,
} from "valibot";
import { Suspense } from "react";

import SearchForm from "./~components/search-form";
import SearchResults from "./~components/search-results";
import { ResultSkeleton } from "./~components/result-card";
import Filters from "./~components/filters";
import { SearchSchema } from "./~components/searchSchema";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getRequestURL } from "@tanstack/react-start/server";
import { getPosts } from "@/server/post/service";
import { searchRecords } from "@/server/search/service";
import { SlidersHorizontal } from "lucide-react";
import {
	Sheet,
	SheetContent,
	SheetTrigger,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

function SearchPage() {
	const searchParams = useSearch({ from: "/_root/_routes/_search/search/" });

	return (
		<div className="container mx-auto px-4 py-4 max-w-7xl">
			{/* Mobile Search Form and Filter Button */}
			<div className="flex flex-col lg:hidden items-stretch gap-3 mb-4">
				<SearchForm />

				{/* Mobile Filter Button */}
				<div className="flex items-center justify-between">
					<div className="text-sm text-muted-foreground">
						Showing results for "{searchParams.query}"
					</div>
					<Sheet>
						<SheetTrigger asChild>
							<Button variant="outline" size="sm" className="gap-2">
								<SlidersHorizontal className="h-4 w-4" />
								Filters
							</Button>
						</SheetTrigger>
						<SheetContent side="bottom" className="h-[80vh]">
							<SheetHeader>
								<SheetTitle>Search Filters</SheetTitle>
							</SheetHeader>
							<div className="mt-4">
								<Suspense>
									<Filters />
								</Suspense>
							</div>
						</SheetContent>
					</Sheet>
				</div>
			</div>

			{/* Desktop Layout */}
			<div className="hidden lg:block mb-6">
				<SearchForm />
			</div>

			<section className="flex gap-6">
				{/* Desktop Sidebar */}
				<aside className="hidden lg:block lg:w-80 flex-shrink-0">
					<div className="sticky top-20">
						<Suspense>
							<Filters />
						</Suspense>
					</div>
				</aside>

				{/* Main Content */}
				<main className="flex-1 min-w-0">
					<div className="hidden lg:block mb-4">
						<div className="text-sm text-muted-foreground">
							Showing results for "{searchParams.query}"
						</div>
					</div>

					<ScrollArea className="h-[calc(100vh-16rem)] lg:h-[calc(100vh-12rem)]">
						<div className="pr-2">
							<Suspense fallback={<ResultSkeleton />}>
								<SearchResults />
							</Suspense>
						</div>
					</ScrollArea>
				</main>
			</section>
		</div>
	);
}

export const Route = createFileRoute("/_root/_routes/_search/search/")({
	component: SearchPage,
	validateSearch: object({
		query: string(),
		page: optional(pipe(number(), integer()), 1),
		subject: optional(array(string())),
		edition: optional(array(string())),
		books: optional(array(string())),
		chapters: optional(array(string())),
	}),
	loaderDeps: ({ search: { query, page } }) => ({ query, page }),
	loader: async ({ deps, context }) => {
		console.log("Loading search results with deps:", deps);

		const posts = await searchRecords({ data: { ...deps, limit: 12 } });
		await context.queryClient.ensureQueryData({
			queryKey: ["posts", deps],
			queryFn: () => posts,
			staleTime: 1000 * 60 * 5, // 5 minutes
		});
		return { posts: { data: posts, count: 12 } };
	},
});
