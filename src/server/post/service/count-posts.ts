import { createServerFn } from "@tanstack/react-start";
import { optional, string } from "valibot";
import { post } from "@/db/schema";
import db from "@/lib/db";
import { count, ilike, sql } from "drizzle-orm";

const postCountStatement = db
  .select({ count: count() })
  .from(post)
  .where(ilike(post.text, sql.placeholder("query")))
  .prepare("get_post_count");

export const countPosts = createServerFn({ method: "GET" })
  .validator(optional(string()))
  .handler(async ({ data: query }) => {
    query = `%${query ?? ""}%`;

    const [{ count }] = await postCountStatement.execute({ query });
    return count;
  });
