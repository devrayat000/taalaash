"use client";

import { deleteBookmarkFn } from "@/server/bookmark/function/create";
import { useServerStore } from "@/hooks/use-server-data";
import { Trash2, X } from "lucide-react";
import { useTransition } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export interface RemoveBookmarkButtonProps {
	postId: string;
	variant?: "icon" | "button" | "minimal";
	className?: string;
}

export default function RemoveBookmarkButton({
	postId,
	variant = "icon",
	className = "",
}: RemoveBookmarkButtonProps) {
	const [isPending, startTransition] = useTransition();
	const queryClient = useQueryClient();
	const toggleStoreBookmark = useServerStore((state) => state.toggleBookmark);

	const removeMutation = useMutation({
		mutationFn: async (postId: string) => {
			return await deleteBookmarkFn({
				data: {
					postId,
					userId: "", // This will be overridden by the server middleware
				},
			});
		},
		onSuccess: () => {
			// Update client state
			toggleStoreBookmark(postId);

			// Invalidate bookmark-related queries
			queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
			queryClient.invalidateQueries({ queryKey: ["bookmarked-posts"] });
		},
		onError: (error) => {
			console.error("Failed to remove bookmark:", error);
		},
	});

	const handleRemove = () => {
		startTransition(() => {
			removeMutation.mutate(postId);
		});
	};

	const isLoading = isPending || removeMutation.isPending;

	if (variant === "minimal") {
		return (
			<button
				type="button"
				onClick={handleRemove}
				disabled={isLoading}
				className={`text-red-500 hover:text-red-700 disabled:opacity-50 ${className}`}
				title="Remove bookmark"
			>
				<X className="h-4 w-4" />
			</button>
		);
	}

	if (variant === "icon") {
		return (
			<AlertDialog>
				<AlertDialogTrigger asChild>
					<Button
						variant="ghost"
						size="sm"
						className={`text-red-500 hover:text-red-700 hover:bg-red-50 ${className}`}
						disabled={isLoading}
					>
						<Trash2 className="h-4 w-4" />
					</Button>
				</AlertDialogTrigger>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Remove Bookmark</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to remove this bookmark? This action cannot
							be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleRemove}
							disabled={isLoading}
							className="bg-red-500 hover:bg-red-600"
						>
							{isLoading ? "Removing..." : "Remove"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		);
	}

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button
					variant="outline"
					size="sm"
					className={`text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200 ${className}`}
					disabled={isLoading}
				>
					<Trash2 className="h-4 w-4 mr-2" />
					Remove Bookmark
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Remove Bookmark</AlertDialogTitle>
					<AlertDialogDescription>
						Are you sure you want to remove this bookmark? This action cannot be
						undone.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction
						onClick={handleRemove}
						disabled={isLoading}
						className="bg-red-500 hover:bg-red-600"
					>
						{isLoading ? "Removing..." : "Remove"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
