import { createFileRoute } from '@tanstack/react-router';

import db from "@/lib/db";
import { ChapterForm } from "./components/chapter-form";
import { eq } from "drizzle-orm";
import { getChapterById } from "@/server/chapter/service";
import { getAllSubjects, getSubjects } from "@/server/subject/service";
import { getBooksBySubject } from "@/server/book/action/book";

const ChapterPage = async ({ params }: { params: { chapterId: string } }) => {
  let initialData: any = {
    subjects: await getAllSubjects(),
  };

  if (params.chapterId !== "new") {
    const chapter = await getChapterById(params.chapterId);
    initialData = {
      ...initialData,
      chapter,
      books: await getBooksBySubject(null, chapter.subject.id),
    };
  }
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ChapterForm initialData={initialData} />
      </div>
    </div>
  );
};




export const Route = createFileRoute('/admin/_routes/chapters/$chapterId')({
  component: ChapterPage
});
