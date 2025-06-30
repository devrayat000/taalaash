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

export type BookFilterProps = {
  books?: { value: string; count: number }[];
  query: string;
};

export default function BookFilter({ books = [], query }: BookFilterProps) {
  const form = useFormContext();
  const [initialBooks, getBooks, isLoading] = useFormState(
    getBooksBySubject,
    books
  );

  useEffect(() => {
    const { unsubscribe } = form.watch(({ subjects }) => {
      if (subjects?.length) {
        // @ts-ignore
        getBooks({ subjects: subjects.map((s) => s.value), query });
      }
    });
    return unsubscribe;
  }, [form, getBooks, query]);

  return (
    <FormField
      control={form.control}
      name="books"
      disabled={
        form.formState.isSubmitting || !initialBooks?.length || isLoading
      }
      render={({ field }) => (
        <FormItem className="mt-2">
          <FormLabel>Books</FormLabel>
          <FormControl>
            <Select
              name={field.name}
              onBlur={field.onBlur}
              isDisabled={field.disabled}
              options={initialBooks}
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
