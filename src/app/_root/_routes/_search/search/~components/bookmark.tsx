"use client";

import { toggleBookmarkFn } from "@/server/bookmark/function/create";
import { useServerStore } from "@/hooks/use-server-data";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { useCallback, useOptimistic, useTransition } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export interface BookmarkButtonProps {
	postId: string;
}

export default function BookmarkButton({ postId }: BookmarkButtonProps) {
	const [isPending, startTransition] = useTransition();
	const queryClient = useQueryClient();

	const bookmarked = useServerStore(
		useCallback(
			(state) => state.bookmarks.some((bm) => bm.postId === postId),
			[postId],
		),
	);
	const toggleStoreBookmark = useServerStore((state) => state.toggleBookmark);

	const [isOptimisticBookmarked, optimisticToggle] = useOptimistic<
		boolean,
		boolean
	>(bookmarked, (prev) => !prev);

	const toggleMutation = useMutation({
		mutationFn: async (data: { postId: string; initial: boolean }) => {
			return await toggleBookmarkFn({
				data: {
					postId: data.postId,
					initial: data.initial,
				},
			});
		},
		onSuccess: () => {
			// Invalidate bookmark-related queries
			queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
			queryClient.invalidateQueries({ queryKey: ["bookmarked-posts"] });
		},
		onError: () => {
			// Revert optimistic update on error
			toggleStoreBookmark(postId);
		},
	});

	function initiateToggle() {
		// Optimistic update
		optimisticToggle(true);
		toggleStoreBookmark(postId);

		// Server update
		startTransition(() => {
			toggleMutation.mutate({
				postId,
				initial: bookmarked,
			});
		});
	}

	return (
		<button
			type="button"
			className="absolute -top-1 right-1 z-50"
			onClick={initiateToggle}
			disabled={isPending || toggleMutation.isPending}
		>
			{!isOptimisticBookmarked ? (
				<Bookmark
					fill="#25A8A8"
					stroke="#ffffff"
					className={`h-10 w-10 ${isPending ? "opacity-50" : ""}`}
				/>
			) : (
				<BookmarkCheck
					fill="#25A8A8"
					stroke="#ffffff"
					className={`h-10 w-10 ${isPending ? "opacity-50" : ""}`}
				/>
			)}
		</button>
	);
}
