import { createFileRoute, useSearch } from "@tanstack/react-router";

import { ServerTableStoreProvider } from "@/providers/server-table-provider";
import { SubjectsClient } from "./~components/client";
import { searchParamsSchema } from "@/lib/schemas";
import { getSubjectsFn } from "@/server/subject/function";
import { useQuery } from "@tanstack/react-query";

const SizesPage = async () => {
	const search = useSearch({ from: "/admin/_routes/subjects/" });
	const { data } = useQuery({
		queryKey: ["subjects", search],
		queryFn: () => getSubjectsFn({ data: search }),
	});

	return (
		<div className="flex-col">
			<div className="flex-1 space-y-4 p-8 pt-6">
				<ServerTableStoreProvider initialData={data!}>
					<SubjectsClient />
				</ServerTableStoreProvider>
			</div>
		</div>
	);
};

export const Route = createFileRoute("/admin/_routes/subjects/")({
	component: SizesPage,
	validateSearch: searchParamsSchema,
	loaderDeps: (opts) => opts.search,
	async loader({ context, deps }) {
		await context.queryClient.ensureQueryData({
			queryKey: ["subjects", deps],
			queryFn: () => getSubjectsFn({ data: deps }),
		});
	},
});
