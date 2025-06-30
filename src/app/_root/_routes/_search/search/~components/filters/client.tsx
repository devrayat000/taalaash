import SubjectFilter from "./subjects";
// import { Form } from "@/components/ui/form";
// import BookFilter from "./books";
// import ChapterFilter from "./chapters";
import { useSearch } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { Fragment } from "react";

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

  const form = useForm({
    defaultValues: {
      subjects:
        initialData?.subjects?.filter((s) =>
          searchParams.subject?.includes(s.value)
        ) || [],
      // books:
      //   initialData?.books?.filter((s) =>
      //     searchParams.getAll("books").includes(s.value)
      //   ) || [],
      // chapters:
      //   initialData?.chapters?.filter((s) =>
      //     searchParams.getAll("chapters").includes(s.value)
      //   ) || [],
    },
  });

  return (
    <Fragment>
      <SubjectFilter subjects={initialData?.subjects} />
      {/* <BookFilter
        books={initialData?.books}
        query={searchParams.get("query")!}
      />
      <ChapterFilter
        chapters={initialData?.chapters}
        query={searchParams.get("query")!}
      /> */}
    </Fragment>
  );
}
