import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { FilterIcon } from "lucide-react";
import FilterClient, { FilterClientProps } from "./client";
import { SearchSchema } from "../searchSchema";

export default function FilterSheet({
  searchParams,
  initialData,
}: {
  searchParams: SearchSchema;
  initialData: FilterClientProps["initialData"];
}) {
  return (
    <Sheet>
      <SheetTrigger asChild className="lg:hidden">
        <Button
          variant="outline"
          className="w-full flex justify-center gap-x-4"
        >
          <FilterIcon size={24} />
          Filter
        </Button>
      </SheetTrigger>
      <SheetContent className="lg:hidden">
        <form>
          <SheetHeader>
            <SheetTitle>Filter</SheetTitle>
          </SheetHeader>
          <div>
            <input type="hidden" name="query" value={searchParams.query} />
            {searchParams?.page && (
              <input type="hidden" name="page" value={searchParams?.page} />
            )}

            <div>
              <FilterClient initialData={initialData} />
            </div>
          </div>
          <SheetFooter className="mt-4">
            <SheetClose asChild>
              <Button type="submit">Save changes</Button>
            </SheetClose>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
