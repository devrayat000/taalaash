import { createFileRoute } from "@tanstack/react-router";

// import { format } from "date-fns";

// import { searchParamsSchema } from "@/lib/schemas";
// import { ChaptersClient } from "./components/client";
// import { getChapters } from "@/server/chapter/service";
// import { ServerTableStoreProvider } from "@/providers/server-table-provider";

const ChaptersPage = async () => {
	// const { page, limit, query } = searchParamsSchema.parse(searchParams);

	return (
		<div className="flex-col">
			<div className="flex-1 space-y-4 p-8 pt-6">
				{/* <ServerTableStoreProvider
          initialData={await getChapters({ page, limit, query })}
        >
          <ChaptersClient />
        </ServerTableStoreProvider> */}
			</div>
		</div>
	);
};

export const Route = createFileRoute("/admin/_routes/chapters/")({
	component: ChaptersPage,
});
