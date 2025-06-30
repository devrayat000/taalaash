import { use } from "react";
import without from "lodash/without";

import { postIndex } from "@/lib/algolia";
import ResultCard, { ResultCardProps } from "./result-card";
import PostPagination from "./pagination";
import { SearchSchema, searchSchema } from "./searchSchema";
import { useLoaderData, useSearch } from "@tanstack/react-router";

export default function SearchResults() {
	const searchParams = useSearch({ from: "/_root/_routes/_search/search/" });
	console.log("Results", searchParams.books);

	// const { page: currentPage, query, subjects, chapters, books } = searchParams;

	// const results = use(
	//   postIndex.search<ResultCardProps>(query, {
	//     optionalWords: query,
	//     hitsPerPage: 12,
	//     page: currentPage - 1,
	//     cacheable: true,
	//     attributesToRetrieve: [
	//       "objectID",
	//       "imageUrl",
	//       "book",
	//       "chapter",
	//       "keywords",
	//     ],
	//     facetFilters: [
	//       subjects?.map((subject) => `subject.name:${subject}`) || [],
	//       books?.map((book) => `book.name:${book}`) || [],
	//       chapters?.map((chapter) => `chapter.name:${chapter}`) || [],
	//     ],
	//   })
	// );

	const {
		posts: { data: posts, count },
	} = useLoaderData({ from: "/_root/_routes/_search/search/" });

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
			<PostPagination
				currentPage={count % 12}
				totalPages={Math.ceil(count / 12)}
			/>
		</div>
	);
}
