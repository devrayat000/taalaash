"use client";

import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
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
import { getBooksBySubject } from "./actions";
import { SearchSchema } from "../searchSchema";
import Select from "@/components/react-select";
import { useFieldContext } from "./form";
import { Label } from "@/components/ui/label";

export type BookFilterProps = {
	books?: { value: string; count: number }[];
	query: string;
};

type FilterItem = { value: string; count: number };

export default function BookFilter({ books = [], query }: BookFilterProps) {
	const field = useFieldContext<FilterItem[]>();
	console.log("BookFilter field", books);

	// const [initialBooks, getBooks, isLoading] = useFieldContext<string[]>();

	// useEffect(() => {
	// 	const { unsubscribe } = form.watch(({ subjects }) => {
	// 		if (subjects?.length) {
	// 			// @ts-ignore
	// 			getBooks({ subjects: subjects.map((s) => s.value), query });
	// 		}
	// 	});
	// 	return unsubscribe;
	// }, [form, getBooks, query]);

	return (
		<div className="mt-2">
			<Label htmlFor={field.name}>Books</Label>
			<Select
				id={field.name}
				name={field.name}
				onBlur={field.handleBlur}
				isDisabled={field.state.meta.isValidating}
				options={books}
				isMulti
				value={field.state.value}
				getOptionValue={(option) => option.value}
				getOptionLabel={(option) => `${option.value} (${option.count})`}
				onChange={(newValue) => field.handleChange(newValue as FilterItem[])}
				closeMenuOnSelect={false}
			/>
			{/* <FormDescription className="text-xs">
						You can select multiple items
					</FormDescription>
					<FormMessage /> */}
		</div>
	);
}
