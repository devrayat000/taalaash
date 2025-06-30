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

async function SearchPage() {
	return (
		<div>
			<div className="flex flex-col lg:hidden items-stretch gap-2 pb-2 px-1">
				<SearchForm />
				{/* <Suspense>
          <Filters searchParams={searchParams} />
        </Suspense> */}
			</div>
			<section className="flex gap-x-2">
				<aside className="lg:basis-80 hidden lg:mt-3 lg:block">
					<Filters />
				</aside>
				<main className="flex-1">
					<ScrollArea className="h-[calc(100vh-12rem)] lg:h-[calc(100vh-5rem)]">
						<div className="pl-4 lg:pl-0 pr-4">
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
	}),
	loaderDeps: ({ search: { query, page } }) => ({ query, page }),
	loader: async ({ deps, context }) => {
		const posts = await searchRecords({ data: { ...deps, limit: 12 } });
		await context.queryClient.ensureQueryData({
			queryKey: ["posts", deps],
			queryFn: () => posts,
			staleTime: 1000 * 60 * 5, // 5 minutes
		});
		return { posts: { data: posts, count: 12 } };
	},
});
