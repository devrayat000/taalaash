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
import { useField } from "@tanstack/react-form";
import { cn } from "@/lib/utils";
import Select from "@/components/react-select";
import { useFieldContext } from "./form";
import { Label } from "@/components/ui/label";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSearch } from "@tanstack/react-router";
import { getBooksBySubject } from "./actions";

export type SubjectFilterProps = {
	subjects?: { value: string; count: number }[];
};

type FilterItem = { value: string; count: number };

export default function SubjectFilter({ subjects }: SubjectFilterProps) {
	const field = useFieldContext<FilterItem[]>();
	const options = subjects ?? [];

	return (
		<div className="mt-2">
			<Label htmlFor={field.name}>Subjects</Label>
			<Select
				id={field.name}
				name={field.name}
				onBlur={field.handleBlur}
				// isDisabled={field.}
				options={options}
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
