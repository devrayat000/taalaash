import React from "react";
import FilterClient, { FilterClientProps } from "./client";
import { Button } from "@/components/ui/button";
import { SearchSchema } from "../searchSchema";

export default function FilterSidebar({
  searchParams,
  initialData,
}: {
  searchParams: SearchSchema;
  initialData: FilterClientProps["initialData"];
}) {
  return (
    <aside className="lg:basis-80 hidden lg:mt-3 lg:block border-r border-border min-h-[calc(100vh-11rem)]">
      <form className="p-4">
        <h3 className="text-2xl font-semibold">Filters</h3>
        <input type="hidden" name="query" value={searchParams.query} />
        {searchParams?.page && (
          <input type="hidden" name="page" value={searchParams?.page} />
        )}

        <div>
          <FilterClient initialData={initialData} />
        </div>

        <Button type="submit" className="mt-5 w-full">
          Apply Filters
        </Button>
      </form>
    </aside>
  );
}
