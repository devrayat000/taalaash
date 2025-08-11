import { use } from "react";
import { SearchSchema, searchSchema } from "./searchSchema";
import { getBooksBySubject, getChaptersByBook } from "./filters/actions";
import FilterSheet from "./filters/sheet";
import FilterSidebar from "./filters/sidebar";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { getSubjectsFn } from "@/server/subject/function";
import { useAppForm } from "./filters/form";

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
					subjects: searchParams.subjects || [],
					query: searchParams.query,
				},
			}),
		enabled: !!searchParams.subjects?.length,
	});
	const { data: chapters } = useQuery({
		queryKey: ["chapters", searchParams.query],
		queryFn: () =>
			getChaptersByBook({
				data: {
					subjects: searchParams.subjects || [],
					books: searchParams.books || [],
					query: searchParams.query,
				},
			}),
		enabled: !!searchParams.subjects?.length && !!searchParams.books?.length,
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

	const navigate = useNavigate();
	const form = useAppForm({
		defaultValues: {
			subjects:
				initial?.subjects?.filter((s) =>
					searchParams.subjects?.includes(s.value),
				) || [],
			books:
				initial?.books?.filter((s) => searchParams.books?.includes(s.value)) ||
				[],
			chapters:
				initial?.chapters?.filter((s) =>
					searchParams.chapters?.includes(s.value),
				) || [],
		},
		onSubmit: async ({ value }) => {
			console.log("Submitting filters:", value);
			navigate({
				to: "/search",
				search: {
					...searchParams,
					subjects: value.subjects.map((s) => s.value),
					books: value.books.map((s) => s.value),
					chapters: value.chapters.map((s) => s.value),
				},
				reloadDocument: false,
				replace: true,
			});
		},
	});

	return (
		<form.AppForm>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					form.handleSubmit();
				}}
			>
				<FilterSidebar initialData={initial} />
				<FilterSheet initialData={initial} />
			</form>
		</form.AppForm>
	);
}
