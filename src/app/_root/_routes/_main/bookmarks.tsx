import { createFileRoute, redirect } from "@tanstack/react-router";

import { getBookmarkedPosts } from "@/server/bookmark/service";
import logoMulti from "@/assets/logo_single.png?url";
import { ServerStoreProvider } from "@/hooks/use-server-data";
// import { requireAuth } from "@/lib/auth";
import ResultCard from "../_search/search/~components/result-card";
import { Link } from "@tanstack/react-router";

function BookmarksPage() {
	const posts = Route.useLoaderData();

	return (
		<div className="p-4 min-h-[calc(100svh-9rem)]">
			<div className="@container/grid bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<Link to="/">
					<div className="flex justify-center">
						<img src={logoMulti} alt="logo" width={200} />
					</div>
				</Link>
				<ServerStoreProvider
					initialData={{
						bookmarks: posts.map((p) => ({ postId: p.objectID })),
						searchHistory: [],
					}}
				>
					<section className="grid @md/grid:grid-cols-2 @lg/grid:grid-cols-3 @xl/grid:grid-cols-4 gap-4 py-8">
						{posts?.map((hit) => (
							<ResultCard key={hit.objectID} {...hit} />
						))}
					</section>
				</ServerStoreProvider>
			</div>
		</div>
	);
}

export const Route = createFileRoute("/_root/_routes/_main/bookmarks")({
	component: BookmarksPage,
	loader: () => getBookmarkedPosts(),
	async beforeLoad({ context }) {
		if (!context.isAuthenticated) {
			throw redirect({ to: "/", search: { error: "Unauthorized" } });
		}
	},
});
