import { createFileRoute } from '@tanstack/react-router';

// import { format } from "date-fns";

import { searchParamsSchema } from "@/lib/schemas";
import { PostsClient } from "./components/client";
import { getPosts } from "@/server/post/service";
import { ServerTableStoreProvider } from "@/providers/server-table-provider";

const PostsPage = async ({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) => {
  const { page, limit, query } = searchParamsSchema.parse(searchParams);

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ServerTableStoreProvider
          initialData={await getPosts({ page, limit, query })}
        >
          <PostsClient />
        </ServerTableStoreProvider>
      </div>
    </div>
  );
};



export const dynamic = true;


export const Route = createFileRoute('/admin/_routes/posts/')({
  component: PostsPage
});
