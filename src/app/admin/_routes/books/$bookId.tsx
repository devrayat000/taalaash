import { createFileRoute } from '@tanstack/react-router';

import db from "@/lib/db";
import { BookForm } from "./components/book-form";
import { eq } from "drizzle-orm";
import { bookAuthor, subject } from "@/db/schema";
import { getBookById } from "@/server/book/service";
import { getAllSubjects, getSubjects } from "@/server/subject/service";
import { Suspense } from "react";

const SizePage = async ({ params }: { params: { bookId: string } }) => {
  let initialData: any = {
    subjects: await getAllSubjects(),
  };

  if (params.bookId !== "new") {
    initialData = {
      ...initialData,
      book: await getBookById(params.bookId),
    };
  } else {
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <Suspense>
          <BookForm initialData={initialData} />
        </Suspense>
      </div>
    </div>
  );
};




export const Route = createFileRoute('/admin/_routes/books/$bookId')({
  component: SizePage
});
