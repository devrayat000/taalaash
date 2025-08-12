"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
	consumeHighlightFn,
	requestHighlightFn,
} from "@/server/post/function/highlight";
// import { PostTable } from "@/server/post/service";
import { useState, useEffect, useRef } from "react";
import { create } from "zustand";

type PostInfo = {
	imageUrl: PostTable["imageUrl"];
	book: {
		name: PostTable["book"]["name"];
	};
	chapter: {
		name: PostTable["book"]["name"];
	};
};

type HighlightBox = {
	left: number;
	top: number;
	width: number;
	height: number;
	word: string;
};

type PopupState = {
	isOpen: boolean;
	open: (data: PostInfo, searchText?: string) => void;
	close: () => void;
	onChange: (open: boolean) => void;
	popupData: PostInfo | null;
	searchText: string | null;
	highlights: HighlightBox[];
	setHighlights: (highlights: HighlightBox[]) => void;
};

export const usePopup = create<PopupState>((set) => ({
	isOpen: false,
	popupData: null,
	searchText: null,
	highlights: [],
	open: (data, searchText) =>
		set({
			isOpen: true,
			popupData: data,
			searchText: searchText || null,
			highlights: [],
		}),
	close: () =>
		set({ isOpen: false, popupData: null, searchText: null, highlights: [] }),
	onChange: (open) =>
		set({ isOpen: open, popupData: null, searchText: null, highlights: [] }),
	setHighlights: (highlights) => set({ highlights }),
}));

const HighlightedImage = ({
	post,
	searchText,
}: {
	post: PostInfo;
	searchText: string;
}) => {
	const [highlights, setHighlights] = useState<HighlightBox[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
	const setPopupHighlights = usePopup((state) => state.setHighlights);
	const hasRequested = useRef(0);

	useEffect(() => {
		hasRequested.current++;
		if (!post.imageUrl || !searchText || hasRequested.current > 1) return;

		// let eventSource: EventSource | null = null;

		const controller = new AbortController();

		const requestHighlightHandler = async (signal: AbortSignal) => {
			try {
				setIsLoading(true);
				setError(null);

				const { taskId } = await requestHighlightFn({
					data: {
						fileUrl: post.imageUrl,
						searchText: searchText,
						metadata: {
							book: post.book.name,
							chapter: post.chapter.name,
						},
					},
					signal,
				}).catch(console.log);
				// const response = await consumeHighlightFn({
				// 	data: { taskId },
				// 	signal: AbortSignal.timeout(45000),
				// });

				const url = new URL(consumeHighlightFn.url, window.origin);
				url.searchParams.append(
					"payload",
					JSON.stringify({
						data: { taskId },
						context: {},
					}),
				);
				url.searchParams.append("createServerFn", "");
				url.searchParams.append("raw", "");

				const source = new EventSource(url, {
					withCredentials: true,
				});

				source.addEventListener("message", (event) => {
					const data = JSON.parse(event.data);
					if (data.status === "completed") {
						if (data.data?.error) {
							setError(data.data.error);
						} else {
							setHighlights(data.data?.highlights || []);
							setPopupHighlights(data.data?.highlights || []);
						}
						setIsLoading(false);
						source.close();
					}
				});

				source.addEventListener("error", (event) => {
					console.error("EventSource error:", event);
					setError("Failed to fetch highlights");
					setIsLoading(false);
					source.close();
				});

				// if (!response.ok) {
				// 	throw new Error("Failed to fetch highlights");
				// }

				// const reader = response.body?.getReader();

				// if (!reader) {
				// 	throw new Error("Failed to read response body");
				// }

				// const decoder = new TextDecoder();

				// while (true) {
				// 	const { done, value } = await reader.read();
				// 	if (done) break;

				// 	const chunk = decoder.decode(value);
				// 	console.log({ chunk });

				// 	try {
				// 		const data = JSON.parse(chunk.replace(/data:\s/, "").trim());

				// 		if (data.status === "completed") {
				// 			if (data.data?.error) {
				// 				setError(data.data.error);
				// 			} else {
				// 				setHighlights(data.data?.highlights || []);
				// 				setPopupHighlights(data.data?.highlights || []);
				// 			}
				// 			setIsLoading(false);
				// 			reader.cancel();
				// 		} else if (data.status === "pending") {
				// 		}
				// 	} catch (parseError) {
				// 		setError("Failed to parse highlight response");
				// 		setIsLoading(false);
				// 		reader.cancel();
				// 		console.error("Failed to parse highlight response:", parseError);
				// 	}
				// }
			} catch (error) {
				console.error("Failed to request highlights:", error);
				setError(
					error instanceof Error
						? error.message
						: "Failed to request highlights",
				);
				setIsLoading(false);
			}
		};

		requestHighlightHandler(controller.signal);
		// Proper cleanup function
		return () => {
			// if (hasRequested.current < 2) controller.abort();
		};
	}, [
		post.imageUrl,
		searchText,
		setPopupHighlights,
		post.book.name,
		post.chapter.name,
	]);

	const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
		const img = e.currentTarget;
		setImageSize({ width: img.clientWidth, height: img.clientHeight });
	};

	const imageRef = useRef<HTMLImageElement>(null);

	return (
		<div className="relative inline-block">
			<img
				ref={imageRef}
				src={post.imageUrl!}
				alt={post.book.name}
				className="rounded-inherit object-cover max-w-full max-h-full"
				onLoad={handleImageLoad}
			/>

			{/* Loading overlay */}
			{isLoading && (
				<div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-inherit backdrop-blur-sm">
					<div className="bg-white/90 px-4 py-2 rounded-lg shadow-lg">
						<div className="flex items-center space-x-2">
							<div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
							<span className="text-gray-800 text-sm font-medium">
								Processing highlights...
							</span>
						</div>
					</div>
				</div>
			)}

			{/* Error overlay */}
			{error && (
				<div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-inherit backdrop-blur-sm">
					<div className="bg-red-50 border border-red-200 px-4 py-3 rounded-lg shadow-lg max-w-xs mx-4">
						<div className="flex items-center space-x-2">
							<div className="w-5 h-5 text-red-500">⚠️</div>
							<div>
								<p className="text-red-800 text-sm font-medium">
									Highlight Error
								</p>
								<p className="text-red-600 text-xs mt-1">{error}</p>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Highlight overlays - Highlighter pen style */}
			{!isLoading &&
				!error &&
				highlights.map((highlight, index) => {
					// Calculate the scale factor between the original image and displayed image
					const img = imageRef.current;
					if (!img) return null;

					const scaleX = img.clientWidth / img.naturalWidth;
					const scaleY = img.clientHeight / img.naturalHeight;

					return (
						<div
							key={index}
							className="absolute pointer-events-none animate-in fade-in-150"
							style={{
								left: highlight.left * scaleX,
								top: highlight.top * scaleY,
								width: highlight.width * scaleX,
								height: highlight.height * scaleY,
								background:
									"linear-gradient(90deg, rgba(255, 255, 0, 0.6) 0%, rgba(255, 235, 59, 0.7) 50%, rgba(255, 255, 0, 0.6) 100%)",
								boxShadow:
									"0 0 8px rgba(255, 235, 59, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
								borderRadius: "2px",
								mixBlendMode: "multiply",
								filter: "blur(0.3px)",
							}}
							title={highlight.word}
						>
							{/* Inner glow effect */}
							<div
								className="absolute inset-0 rounded-sm"
								style={{
									background:
										"linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%)",
									animation: "shimmer 2s ease-in-out infinite",
								}}
							/>
						</div>
					);
				})}
		</div>
	);
};

export const PopupProvider = () => {
	const popupStore = usePopup();
	const post = popupStore.popupData;
	const searchText = popupStore.searchText;

	return (
		<Dialog
			open={popupStore.isOpen}
			onOpenChange={(open) => !open && popupStore.close()}
			modal
		>
			<DialogContent
				forceMount
				className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 aspect-[3/4] max-w-[90vw] max-h-[90vh]"
			>
				{popupStore.isOpen && !!post && (
					<>
						{searchText ? (
							<HighlightedImage post={post} searchText={searchText} />
						) : (
							<img
								src={post.imageUrl!}
								alt={post.book.name}
								className="rounded-inherit object-cover max-w-full max-h-full"
							/>
						)}
					</>
				)}
			</DialogContent>
		</Dialog>
	);
};
