import { createFileRoute } from "@tanstack/react-router";

import { Suspense } from "react";
// import dynamic from "next/dynamic";

// import { getPostById } from "@/server/post/service";
// import { getAllSubjects } from "@/server/subject/service";
// import { getBooksBySubject } from "@/server/book/action/book";
// import { getChaptersByBooks } from "@/server/chapter/action/chapter";

// const PostForm = dynamic(
//   () => import("./components/post-form").then((m) => ({ default: m.PostForm })),
//   {
//     ssr: false,
//   }
// );

const PostPage = async ({ params }: { params: { postId: string } }) => {
	// let initialData: any = {
	//   subjects: await getAllSubjects(),
	// };

	// if (params.postId !== "new" && params.postId !== "bulk") {
	//   const post = await getPostById(params.postId);
	//   initialData = {
	//     ...initialData,
	//     post,
	//     books: await getBooksBySubject(null, post.subject!.id),
	//     chapters: await getChaptersByBooks(null, post.book!.id),
	//   };
	// }

	return (
		<div className="flex-col">
			<div className="flex-1 space-y-4 p-8 pt-6" suppressHydrationWarning>
				{/* <Suspense>
          <PostForm initialData={initialData} />
        </Suspense> */}
			</div>
		</div>
	);
};

export const Route = createFileRoute("/admin/_routes/posts/$postId")({
	component: PostPage,
});
