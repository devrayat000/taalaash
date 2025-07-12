import { searchParamsSchema } from "@/lib/schemas";
import { getPosts } from "@/server/post/service";
import { useQuery } from "@tanstack/react-query";
import { useSearch } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { ServerTableStoreProvider } from "@/providers/server-table-provider";
import { PostsClient } from "./~components/client";
import { Button } from "@/components/ui/button";
import { useServerFn } from "@tanstack/react-start";
import { recognizeText } from "@/server/post/action/indexing";

const PostsPage = () => {
	const search = useSearch({ from: "/admin/_routes/posts/" });
	const { data } = useQuery({
		queryKey: ["posts", search],
		queryFn: () => getPosts({ data: search }),
	});
	const recognize = useServerFn(recognizeText);

	return (
		<div className="flex-col">
			<form action={(formData) => void recognize({ data: formData })}>
				<div className="flex items-center justify-between mb-4">
					<input
						id="fileInput"
						type="file"
						name="file"
						accept="image/*"
						// className="hidden"
					/>
				</div>
				<div className="flex items-center justify-between mb-4">
					<Button type="submit" className="bg-blue-500 hover:bg-blue-600">
						Recognize Text
					</Button>
				</div>
			</form>
			<div className="flex-1 space-y-4 p-8 pt-6">
				<ServerTableStoreProvider initialData={data!}>
					<PostsClient />
				</ServerTableStoreProvider>
			</div>
		</div>
	);
};

export const dynamic = true;

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
