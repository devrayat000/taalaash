"use client";

import { toggleBookmark } from "@/server/bookmark/action/bookmark";
import { useServerStore } from "@/hooks/use-server-data";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { useCallback, useOptimistic } from "react";
import { useFormState } from "react-dom";

export interface BookmarkButtonProps {
	postId: string;
}

export default function BookmarkButton({ postId }: BookmarkButtonProps) {
	const bookmarked = useServerStore(
		useCallback(
			(state) => state.bookmarks.some((bm) => bm.postId === postId),
			[postId],
		),
	);
	const toggleStoreBookmark = useServerStore((state) => state.toggleBookmark);

	const [isBookmarked, toggle] = useFormState(toggleBookmark, bookmarked);
	const [isOptimisticBookmarked, optimisticToggle] = useOptimistic<
		boolean,
		boolean
	>(isBookmarked, (prev, current) => !prev);

	function initiateToggle() {
		optimisticToggle(true);
		toggle(postId);
		toggleStoreBookmark(postId);
	}

	return (
		<button
			type="button"
			className="absolute -top-1 right-1 z-50"
			onClick={initiateToggle}
		>
			{!isOptimisticBookmarked ? (
				<Bookmark fill="#25A8A8" stroke="#ffffff" className="h-10 w-10" />
			) : (
				<BookmarkCheck fill="#25A8A8" stroke="#ffffff" className="h-10 w-10" />
			)}
		</button>
	);
}
