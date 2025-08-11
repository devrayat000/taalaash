import { use } from "react";
import without from "lodash/without";

import ResultCard from "./result-card";
import PostPagination from "./pagination";
import { SearchSchema, searchSchema } from "./searchSchema";
import { useLoaderData, useSearch } from "@tanstack/react-router";
import { searchRecords } from "@/server/search/service";
import { useSuspenseQuery } from "@tanstack/react-query";

export default function SearchResults() {
	const search = useSearch({ from: "/_root/_routes/_search/search/" });
	const { data } = useSuspenseQuery({
		queryKey: ["posts", search] as const,
		queryFn: ({ queryKey: [, params] }) =>
			searchRecords({ data: { ...params, limit: 12 } }),
		staleTime: 1000 * 60 * 5, // 5 minutes
	});

	// Defensive: handle not found or missing data
	const posts = data ?? [];
	const count = 0;

	return (
		<div className="@container/grid w-full">
			<section className="flex flex-col @sm/grid:grid @sm/grid:grid-cols-2 @md/grid:grid-cols-3 gap-4 py-8">
				{posts.length ? (
					posts.map((post) => <ResultCard key={post.id} {...post} />)
				) : (
					<div className="flex justify-center">
						<p>Nothing found... 😓</p>
					</div>
				)}
			</section>
			{/* <PostPagination
				currentPage={count % 12}
				totalPages={Math.ceil(count / 12)}
			/> */}
		</div>
	);
}
