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

export type SubjectFilterProps = {
  subjects?: { value: string; count: number }[];
};

export default function SubjectFilter({ subjects }: SubjectFilterProps) {
  const field = useField({});

  return (
    <FormField
      control={form.control}
      name="subjects"
      disabled={form.formState.isSubmitting || !subjects}
      render={({ field }) => (
        <FormItem className="mt-2">
          <FormLabel>Subjects</FormLabel>
          <FormControl>
            <Select
              name={field.name}
              onBlur={field.onBlur}
              isDisabled={field.disabled}
              options={subjects}
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
