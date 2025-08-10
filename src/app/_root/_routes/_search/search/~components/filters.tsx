import { use } from "react";
import { SearchSchema, searchSchema } from "./searchSchema";
import { getBooksBySubject, getChaptersByBook } from "./filters/actions";
import FilterSheet from "./filters/sheet";
import FilterSidebar from "./filters/sidebar";
import { useSearch } from "@tanstack/react-router";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { getSubjectsFn } from "@/server/subject/function";

// TODO: Implement progressive filtering
export default function Filters() {
	const searchParams = useSearch({ from: "/_root/_routes/_search/search/" });

	// const subjects = use(
	//   postIndex.searchForFacetValues("subject.name", "", {
	//     maxFacetHits: 100,
	//     query: params.query,
	//   })
	// );
	const { data: subjects } = useSuspenseQuery({
		queryKey: ["subjects", searchParams.query],
		queryFn: () => getSubjectsFn(),
	});

	const { data: books } = useQuery({
		queryKey: ["books", searchParams.query],
		queryFn: () =>
			getBooksBySubject({
				data: {
					subjects: searchParams.subject || [],
					query: searchParams.query,
				},
			}),
		enabled: !!searchParams.subject?.length,
	});
	const { data: chapters } = useQuery({
		queryKey: ["chapters", searchParams.query],
		queryFn: () =>
			getChaptersByBook({
				data: {
					subjects: searchParams.subject || [],
					books: searchParams.books || [],
					query: searchParams.query,
				},
			}),
		enabled: !!searchParams.subject?.length,
	});

	// const books = params.subjects?.length
	//   ? use(
	//       getBooksBySubject([], {
	//         subjects: params.subjects || [],
	//         query: params.query,
	//       })
	//     )
	//   : undefined;
	// console.log("Filter Component", params.books);

	// const chapters = params.books?.length
	//   ? use(
	//       getChaptersByBook([], {
	//         subjects: params.subjects || [],
	//         books: params.books || [],
	//         query: params.query,
	//       })
	//     )
	//   : undefined;

	const initial = {
		subjects: subjects.data?.map((s) => ({ value: s.name, count: 0 })) || [],
		books: books,
		chapters: chapters,
		//   books: books,
		//   chapters: chapters,
	};

	return (
		<>
			<FilterSidebar initialData={initial} />
			<FilterSheet initialData={initial} />
		</>
	);
}
