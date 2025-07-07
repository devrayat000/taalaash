import { createFileRoute, useSearch } from "@tanstack/react-router";

import { ServerTableStoreProvider } from "@/providers/server-table-provider";
import { ChaptersClient } from "./~components/client";
import { searchParamsSchema } from "@/lib/schemas";
import { getChapters } from "@/server/chapter/service";
import { useQuery } from "@tanstack/react-query";

const ChaptersPage = async () => {
	const search = useSearch({ from: "/admin/_routes/chapters/" });
	const { data } = useQuery({
		queryKey: ["chapters", search],
		queryFn: () => getChapters({ data: search }),
	});

	return (
		<div className="flex-col">
			<div className="flex-1 space-y-4 p-8 pt-6">
				<ServerTableStoreProvider initialData={data!}>
					<ChaptersClient />
				</ServerTableStoreProvider>
			</div>
		</div>
	);
};

export const Route = createFileRoute("/admin/_routes/chapters/")({
	component: ChaptersPage,
	validateSearch: searchParamsSchema,
	loaderDeps: (opts) => opts.search,
	async loader({ context, deps }) {
		await context.queryClient.ensureQueryData({
			queryKey: ["chapters", deps],
			queryFn: () => getChapters({ data: deps }),
		});
	},
});
