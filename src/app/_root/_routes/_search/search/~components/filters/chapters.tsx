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
import { getChaptersByBook } from "./actions";
import Select from "@/components/react-select";

export type ChapterFilterProps = {
  chapters?: { value: string; count: number }[];
  query: string;
};

export default function ChapterFilter({ query, chapters }: ChapterFilterProps) {
  const form = useFormContext();
  const [initialChapters, getChapters, isLoading] = useFormState(
    getChaptersByBook,
    chapters ?? []
  );

  useEffect(() => {
    const { unsubscribe } = form.watch(({ books, subjects }) => {
      // if (books.length || subjects.length) {
      getChapters({
        // @ts-ignore
        books: books?.map((s) => s.value) || [],
        // @ts-ignore
        subjects: subjects?.map((s) => s.value) || [],
        query,
      });
      // }
    });
    return unsubscribe;
  }, [form, getChapters, query]);

  return (
    <FormField
      control={form.control}
      name="chapters"
      disabled={
        form.formState.isSubmitting || !initialChapters?.length || isLoading
      }
      render={({ field }) => (
        <FormItem className="mt-2">
          <FormLabel>Chapters</FormLabel>
          <FormControl>
            <Select
              name={field.name}
              onBlur={field.onBlur}
              isDisabled={field.disabled}
              options={initialChapters}
              isMulti
              value={field.value}
              getOptionValue={(option) => option.value}
              getOptionLabel={(option) => `${option.value} (${option.count})`}
              onChange={field.onChange}
              closeMenuOnSelect={false}
            />
          </FormControl>
          <FormDescription className="text-xs">
            You can select multiple items
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
