import { createFileRoute } from "@tanstack/react-router";
import { eq } from "drizzle-orm";

import logoSingle from "@/assets/logo_single.png?url";
import SearchForm from "../_search/search/~components/search-form";
import { Button } from "@/components/ui/button";
import { createServerFn, useServerFn } from "@tanstack/react-start";
import db from "@/lib/db";
import { post } from "@/db/schema";
import { upsertPosts } from "@/server/search/action/upsert";

const upsertTestPages = createServerFn({ method: "GET" }).handler(async () => {
	console.log("Upserting test pages...");

	const postIds = await db
		.select({ id: post.id })
		.from(post)
		.where(eq(post.chapterId, "006fd49d-8855-4fae-9819-a9b2f6305747"));
	return postIds.map((p) => p.id);
	// return await upsertPosts.__executeServer({
	// 	data: { postIds:  },
	// });
});

function LandingPage() {
	// const upsert = useServerFn(upsertTestPages);
	return (
		<div className="h-full flex justify-center min-h-[calc(100svh-8.5rem)]">
			<div className="w-full max-w-[52rem] my-20 mx-auto">
				<div className="flex justify-center mb-10">
					<img src={logoSingle} alt="logo" width={200} />
				</div>
				<div className="max-w-[52rem] mx-auto">
					<SearchForm />
				</div>
			</div>
		</div>
	);
}

export const Route = createFileRoute("/_root/_routes/_main/")({
	component: LandingPage,
});
