import { createFileRoute, useSearch } from "@tanstack/react-router";
import {
	array,
	int,
	number,
	object,
	optional,
	pipe,
	string,
	_default,
} from "zod/v4-mini";
import { Fragment, Suspense } from "react";

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
import Lottie from "lottie-react";
import {
	Sheet,
	SheetContent,
	SheetTrigger,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import searchinglg from "@/assets/animation/searching.json";
import searchingsm from "@/assets/animation/search_imm.json";
import { useWindowSize } from "@uidotdev/usehooks";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_root/_routes/_search/search/")({
	component: SearchPage,
	validateSearch: object({
		query: string(),
		page: _default(optional(int()), 1),
		subject: optional(array(string())),
		edition: optional(array(string())),
		books: optional(array(string())),
		chapters: optional(array(string())),
	}),
	loaderDeps: ({ search: { query, page } }) => ({ query, page }),
	loader: async ({ deps, context }) => {
		console.log("Loading search results with deps:", deps);
		context.queryClient.ensureQueryData({
			queryKey: ["posts", deps],
			queryFn: () => searchRecords({ data: { ...deps, limit: 12 } }),
			staleTime: 1000 * 60 * 5, // 5 minutes
		});
	},
});

function SearchLoader() {
	const { width } = useWindowSize();
	return (
		width !== null && (
			<div className="flex items-center justify-center h-full">
				<Lottie
					animationData={width > 768 ? searchinglg : searchingsm}
					loop
					className={cn(width <= 768 && "scale-150")}
				/>
			</div>
		)
	);
}

function SearchPage() {
	const searchParams = useSearch({ from: "/_root/_routes/_search/search/" });

	return (
		<div className="container mx-auto px-4 py-4 max-w-7xl">
			{/* Mobile Search Form and Filter Button */}
			<div className="flex flex-col lg:hidden items-stretch gap-3 mb-4">
				<SearchForm />

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

					{/* <ScrollArea className="h-[calc(100vh-16rem)] lg:h-[calc(100vh-12rem)]"> */}
					<div className="pr-2 h-[calc(100vh-16rem)]">
						<SearchLoader />
						{/* <Suspense fallback={<SearchLoader />}>
								<SearchResults />
							</Suspense> */}
					</div>
					{/* </ScrollArea> */}
				</main>
			</section>
		</div>
	);
}
