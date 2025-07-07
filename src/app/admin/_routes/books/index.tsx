import { createFileRoute, useSearch } from "@tanstack/react-router";

import { ServerTableStoreProvider } from "@/providers/server-table-provider";
import { BooksClient } from "./~components/client";
import { searchParamsSchema } from "@/lib/schemas";
import { getBooks } from "@/server/book/service";
import { useQuery } from "@tanstack/react-query";

const SizesPage = async () => {
	const search = useSearch({ from: "/admin/_routes/books/" });
	const { data } = useQuery({
		queryKey: ["books", search],
		queryFn: () => getBooks({ data: search }),
	});

	return (
		<div className="flex-col">
			<div className="flex-1 space-y-4 p-8 pt-6">
				<ServerTableStoreProvider initialData={data!}>
					<BooksClient />
				</ServerTableStoreProvider>
			</div>
		</div>
	);
};

export const Route = createFileRoute("/admin/_routes/books/")({
	component: SizesPage,
	validateSearch: searchParamsSchema,
	loaderDeps: (opts) => opts.search,
	async loader({ context, deps }) {
		await context.queryClient.ensureQueryData({
			queryKey: ["books", deps],
			queryFn: () => getBooks({ data: deps }),
		});
	},
});
