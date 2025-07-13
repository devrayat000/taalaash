import { searchParamsSchema } from "@/lib/schemas";
import { getPosts } from "@/server/post/service";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useSearch } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { ServerTableStoreProvider } from "@/providers/server-table-provider";
import { PostsClient } from "./~components/client";

const PostsPage = () => {
	const search = useSearch({ from: "/admin/_routes/posts/" });
	const { data } = useSuspenseQuery({
		queryKey: ["posts", search],
		queryFn: () => getPosts({ data: search }),
	});

	return (
		<div className="flex-col">
			<div className="flex-1 space-y-4 p-8 pt-6">
				<ServerTableStoreProvider initialData={data!}>
					<PostsClient />
				</ServerTableStoreProvider>
			</div>
		</div>
	);
};

export const Route = createFileRoute("/admin/_routes/posts/")({
	component: PostsPage,
	validateSearch: searchParamsSchema,
	loaderDeps: (opts) => opts.search,
	async loader({ context, deps }) {
		await context.queryClient.ensureQueryData({
			queryKey: ["posts", deps],
			queryFn: () => getPosts({ data: deps }),
		});
	},
});
