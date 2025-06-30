// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
import { useFormContext } from "react-hook-form";
import { useFormState } from "react-dom";
import { useEffect } from "react";
import { getChaptersByBook } from "./actions";
import Select from "@/components/react-select";
import { useFieldContext } from "./form";
import { useQueryClient } from "@tanstack/react-query";
import { useSearch } from "@tanstack/react-router";
import { Label } from "@/components/ui/label";

export type ChapterFilterProps = {
	chapters?: { value: string; count: number }[];
	query: string;
};

export default function ChapterFilter({ query, chapters }: ChapterFilterProps) {
	const field = useFieldContext<{ value: string; count: number }[]>();
	// const queryClient = useQueryClient();
	// const searchParams = useSearch({ from: "/_root/_routes/_search/search/" });

	// const [initialChapters, getChapters, isLoading] = useFormState(
	// 	getChaptersByBook,
	// 	chapters ?? [],
	// );

	return (
		<div className="mt-2">
			<Label htmlFor={field.name}>Chapters</Label>
			<Select
				id={field.name}
				name={field.name}
				onBlur={field.handleBlur}
				isDisabled={field.state.meta.isValidating}
				options={chapters}
				isMulti
				value={field.state.value}
				getOptionValue={(option) => option.value}
				getOptionLabel={(option) => `${option.value} (${option.count})`}
				onChange={(newValue) =>
					field.handleChange(newValue as { value: string; count: number }[])
				}
				closeMenuOnSelect={false}
			/>
			{/* <FormDescription className="text-xs">
				You can select multiple items
			</FormDescription>
			<FormMessage /> */}
		</div>
	);
}
