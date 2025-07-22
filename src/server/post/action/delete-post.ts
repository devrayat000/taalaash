import db from "@/lib/db";
import { authed } from "@/server/middleware";
import { createServerFn } from "@tanstack/react-start";
import { object, uuid } from "zod/v4-mini";

export const deletePost = createServerFn({ method: "POST" })
	.middleware([authed])
	.validator(
		object({
			id: uuid(),
		}),
	)
	.handler(async ({ data }) => {
		// Implement your delete logic here
		console.log("Deleting post with ID:", data.id);
		// delet from database
		// await db.
	});
