import { createFileRoute, redirect } from "@tanstack/react-router";

import { Suspense } from "react";

import { getPostById } from "@/server/post/service";
import { getSubjectsFn } from "@/server/subject/function";
import { getBooksBySubject } from "@/server/book/action/book";
import { getChaptersByBooks } from "@/server/chapter/action/chapter";
import { PostForm } from "./~components/post-form";

// const PostForm = dynamic(
//   () => import("./components/post-form").then((m) => ({ default: m.PostForm })),
//   {
//     ssr: false,
//   }
// );

const PostPage = () => {
	return (
		<div className="flex-col">
			<div className="flex-1 space-y-4 p-8 pt-6" suppressHydrationWarning>
				<Suspense>
					<PostForm initialData={Route.useLoaderData()} />
				</Suspense>
			</div>
		</div>
	);
};

export const Route = createFileRoute("/admin/_routes/posts/$postId")({
	component: PostPage,
	beforeLoad({ params }) {
		if (params.postId === "new") {
			throw redirect({
				to: "/admin/posts/new",
				replace: true,
			});
		}
	},
	async loader({ context, params }) {
		if (params.postId !== "new" && params.postId !== "bulk") {
			const post = await context.queryClient.ensureQueryData({
				queryKey: ["post", params.postId],
				queryFn: () => getPostById({ data: params.postId }),
			});
			context.queryClient.ensureQueryData({
				queryKey: ["posts", post?.id, "book"],
				queryFn: () => getBooksBySubject({ data: { id: post?.subject.id } }),
			});
			context.queryClient.ensureQueryData({
				queryKey: ["posts", post?.id, "chapter"],
				queryFn: () => getChaptersByBooks({ data: { id: post?.book.id } }),
			});
		}
		const subjects = await context.queryClient.ensureQueryData({
			queryKey: ["subjects"],
			queryFn: () => getSubjectsFn(),
		});
		return { subjects };
	},
});
