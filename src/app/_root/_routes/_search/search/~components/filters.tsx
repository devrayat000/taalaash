import { use } from "react";
import { SearchSchema, searchSchema } from "./searchSchema";
import { getBooksBySubject, getChaptersByBook } from "./filters/actions";
import FilterSheet from "./filters/sheet";
import FilterSidebar from "./filters/sidebar";
import { useSearch } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getAllSubjects } from "@/server/subject/service";

// TODO: Implement progressive filtering
export default function Filters() {
  const searchParams = useSearch({ from: "/_root/_routes/_search/search/" });

  // const subjects = use(
  //   postIndex.searchForFacetValues("subject.name", "", {
  //     maxFacetHits: 100,
  //     query: params.query,
  //   })
  // );
  const { data: subjects } = useQuery({
    queryKey: ["subjects", searchParams.query],
    queryFn: () => getAllSubjects(),
  });

  // const books = params.subjects?.length
  //   ? use(
  //       getBooksBySubject([], {
  //         subjects: params.subjects || [],
  //         query: params.query,
  //       })
  //     )
  //   : undefined;
  // console.log("Filter Component", params.books);

  // const chapters = params.books?.length
  //   ? use(
  //       getChaptersByBook([], {
  //         subjects: params.subjects || [],
  //         books: params.books || [],
  //         query: params.query,
  //       })
  //     )
  //   : undefined;

  const initial = {
    subjects: subjects,
    //   books: books,
    //   chapters: chapters,
  };

  return (
    <>
      <FilterSidebar initialData={initial} searchParams={searchParams} />
      {/* <FilterSheet initialData={initial} searchParams={searchParams} /> */}
    </>
  );
}
