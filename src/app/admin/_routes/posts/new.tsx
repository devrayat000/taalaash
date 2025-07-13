import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { NewPostForm } from "./~components/new-post-form";
import { getAllSubjects } from "@/server/subject/service";

export const Route = createFileRoute("/admin/_routes/posts/new")({
	component: RouteComponent,
	async loader({ context }) {
		const subjects = await context.queryClient.ensureQueryData({
			queryKey: ["subjects"],
			queryFn: () => getAllSubjects(),
		});
		return { subjects };
	},
});

function RouteComponent() {
	return (
		<div className="flex-col">
			<div className="flex-1 space-y-4 p-8 pt-6" suppressHydrationWarning>
				<Suspense>
					<NewPostForm />
				</Suspense>
			</div>
		</div>
	);
}
