import SubjectFilter from "./subjects";
// import { Form } from "@/components/ui/form";
import BookFilter from "./books";
import ChapterFilter from "./chapters";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { Fragment, useEffect } from "react";
import { useAppForm, formContext, useFormContext } from "./form";
import { useQueryClient } from "@tanstack/react-query";
import { getBooksBySubject } from "./actions";

type FilterItem = { value: string; count: number };

export interface FilterClientProps {
	initialData?: {
		subjects?: FilterItem[];
		books?: FilterItem[];
		chapters?: FilterItem[];
	};
}

export default function FilterClient({ initialData }: FilterClientProps) {
	const searchParams = useSearch({ from: "/_root/_routes/_search/search/" });
	const navigate = useNavigate();
	const form = useFormContext();

	const queryClient = useQueryClient();

	useEffect(() => {
		return form.store.subscribe(async (state) => {
			if (
				!!state.currentVal.values.subjects.length &&
				state.currentVal.values.subjects.length !==
					state.prevVal?.values.subjects.length
			) {
				const updatedAt = Date.now();
				const books = await getBooksBySubject({
					data: {
						subjects:
							state.currentVal.values.subjects.map((s) => s.value) || [],
						query: searchParams.query,
					},
				});
				queryClient.setQueryData(["books", searchParams.query], books, {
					updatedAt,
				});
			}
		});
	}, [form.store.subscribe, queryClient.setQueryData, searchParams.query]);

	return (
		<Fragment>
			<form.AppField name="subjects">
				{() => <SubjectFilter subjects={initialData?.subjects ?? []} />}
			</form.AppField>
			<form.AppField name="books">
				{() => (
					<BookFilter
						books={initialData?.books ?? []}
						query={searchParams.query}
					/>
				)}
			</form.AppField>
			<form.AppField name="chapters">
				{() => (
					<ChapterFilter
						chapters={initialData?.chapters ?? []}
						query={searchParams.query}
					/>
				)}
			</form.AppField>
		</Fragment>
	);
}
