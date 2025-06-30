import { createFileRoute } from '@tanstack/react-router';

import { ServerTableStoreProvider } from "@/providers/server-table-provider";
import { SubjectsClient } from "./components/client";
import { searchParamsSchema } from "@/lib/schemas";
import { getSubjects } from "@/server/subject/service";

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
          initialData={await getSubjects({ page, limit, query })}
        >
          <SubjectsClient />
        </ServerTableStoreProvider>
      </div>
    </div>
  );
};



export const dynamic = true;


export const Route = createFileRoute('/admin/_routes/subjects/')({
  component: SizesPage
});
