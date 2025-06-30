import { createFileRoute } from '@tanstack/react-router';

import { searchParamsSchema } from "@/lib/schemas";
import { BooksClient } from "./components/client";
import { getBooks } from "@/server/book/service";
import { ServerTableStoreProvider } from "@/providers/server-table-provider";

const SizesPage = async ({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) => {
  const { page, limit, query } = searchParamsSchema.parse(searchParams);

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ServerTableStoreProvider
          initialData={await getBooks({ page, limit, query })}
        >
          <BooksClient />
        </ServerTableStoreProvider>
      </div>
    </div>
  );
};



export const dynamic = true;


export const Route = createFileRoute('/admin/_routes/books/')({
  component: SizesPage
});
