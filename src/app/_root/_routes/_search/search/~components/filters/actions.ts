"use server";

import without from "lodash/without";

import { postIndex } from "@/lib/algolia";

export async function getBooksBySubject(
  _: { value: string }[],
  { subjects, query }: { subjects: string[]; query: string }
) {
  // const facets = without([subject ? `subject.name:${subject}` : null], null);

  const books = await postIndex.searchForFacetValues("book.name", "", {
    maxFacetHits: 100,
    // @ts-ignore
    facetFilters: [subjects?.map((subject) => `subject.name:${subject}`)],
    query,
  });

  return books.facetHits;
}

export async function getChaptersByBook(
  _: { value: string }[],
  {
    books,
    subjects,
    query,
  }: { books: string[]; subjects: string[]; query: string }
) {
  console.log(books, subjects, query);

  const chapters = await postIndex.searchForFacetValues("chapter.name", "", {
    maxFacetHits: 100,
    // @ts-ignore
    facetFilters: [
      books?.map((book) => `book.name:${book}`),
      subjects?.map((subject) => `subject.name:${subject}`),
    ],
    query,
  });
  return chapters.facetHits;
}
