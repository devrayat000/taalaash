import { createFileRoute, redirect } from "@tanstack/react-router";

import { getBookmarkedPostsFn } from "@/server/bookmark/function/get";
import logoMulti from "@/assets/logo_single.png?url";
import { ServerStoreProvider } from "@/hooks/use-server-data";
import ResultCard from "../_search/search/~components/result-card";
import { Link } from "@tanstack/react-router";

type BookmarkedPost = {
	id: string;
	page: number | null;
	keywords: string[] | null;
	imageUrl: string;
	createdAt: Date;
	chapterId: string;
	chapter: {
		id: string;
		name: string;
	};
	book: {
		id: string;
		name: string;
	};
	subject: {
		id: string;
		name: string;
	};
};

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

				{posts.length === 0 ? (
					<div className="text-center py-12">
						<div className="text-gray-500 text-lg mb-4">No bookmarks yet</div>
						<p className="text-gray-400 mb-6">
							Start bookmarking posts to see them here
						</p>
						<Link
							to="/"
							search={{}}
							className="inline-flex items-center px-4 py-2 bg-[#25A8A8] text-white rounded-md hover:bg-[#20a0a0] transition-colors"
						>
							Browse Posts
						</Link>
					</div>
				) : (
					<>
						<div className="flex justify-between items-center py-4">
							<h1 className="text-2xl font-bold">My Bookmarks</h1>
							<div className="text-sm text-gray-500">
								{posts.length} bookmark{posts.length !== 1 ? "s" : ""}
							</div>
						</div>

						<ServerStoreProvider
							initialData={{
								bookmarks: posts.map((p: BookmarkedPost) => ({ postId: p.id })),
								searchHistory: [],
							}}
						>
							<section className="grid @md/grid:grid-cols-2 @lg/grid:grid-cols-3 @xl/grid:grid-cols-4 gap-4 py-8">
								{posts?.map((hit: BookmarkedPost) => (
									<ResultCard key={hit.id} {...hit} />
								))}
							</section>
						</ServerStoreProvider>
					</>
				)}
			</div>
		</div>
	);
}

export const Route = createFileRoute("/_root/_routes/_main/bookmarks")({
	component: BookmarksPage,
	loader: () => getBookmarkedPostsFn(),
	async beforeLoad({ context }) {
		if (!context.isAuthenticated) {
			throw redirect({ to: "/", search: { error: "Unauthorized" } });
		}
	},
});
