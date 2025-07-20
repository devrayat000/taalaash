"use client";

import { PostHit } from "@/server/post/service";
import BookmarkButton from "./bookmark";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePopup } from "@/providers/popup-provider";
import { useSearch } from "@tanstack/react-router";
import type { PostWithAllRelations } from "@/server/post/service/get-filtered-posts";

export default function ResultCard(post: PostWithAllRelations) {
	const searchParams = useSearch({ from: "/_root/_routes/_search/search/" });
	const query = searchParams.query || "";

	const handleFullPageClick = () => {
		usePopup.getState().open(post);
	};

	const handleHighlightedClick = () => {
		usePopup.getState().open(post, query);
	};

	return (
		<article className="rounded-lg overflow-hidden shadow-lg">
			<div className="relative isolate aspect-[3/4] rounded-t-inherit border-border border">
				<img
					src={post.imageUrl!}
					alt={post.book.name}
					className="rounded-inherit object-cover"
				/>
				{/* <BookmarkButton postId={post.objectID} /> */}
			</div>
			<div className="bg-card-result p-3 space-y-4">
				<div className="">
					<h6 className="text-base font-medium leading-none mt-px">
						{post.book.name}
					</h6>
					<div className="flex gap-x-2 h-full items-center">
						<span className="block text-xs leading-none">
							{post.book.edition} - Edition
						</span>

						<span className="rounded-full block w-1 h-1 bg-muted-foreground"></span>

						<p className="text-xs rounded-full leading-none justify-self-end">
							{post.chapter.name}
						</p>
					</div>
				</div>
				<div className="mt-1 flex gap-x-2">
					<Button
						size="sm"
						variant="secondary"
						className="text-xs h-7 py-0.5 leading-none bg-[#364744] hover:bg-[#364744]/90 text-white flex-1"
						title="Result image"
						onClick={handleFullPageClick}
					>
						Full Page
					</Button>
					<Button
						size="sm"
						variant="default"
						className="text-xs h-7 py-0.5 leading-none bg-[#00B894] hover:bg-[#00B894]/90 flex-1"
						title="Marked image"
						onClick={handleHighlightedClick}
					>
						Highlighted
					</Button>
				</div>
			</div>
		</article>
	);
}

export function ResultSkeleton() {
	return (
		<section className="flex flex-col sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 py-8">
			{Array.from(new Array(12).keys()).map((index) => (
				<article key={index} className="rounded-2xl overflow-hidden shadow-lg">
					<Skeleton className="aspect-[3/4] rounded-t-inherit border-border border" />
					<div className="grid grid-cols-3 gap-x-2 h-full text-white bg-card-result px-3 py-2">
						<div>
							<Skeleton className="h-2" />
							<Skeleton className="h-6 mt-px" />
						</div>
						<Skeleton className="h-7 py-0.5 rounded-full" />
						<div>
							<Skeleton className="h-3 rounded-full" />
							<Skeleton className="h-3 rounded-full" />
						</div>
					</div>
				</article>
			))}
		</section>
	);
}
