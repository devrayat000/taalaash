import { createServerFn } from "@tanstack/react-start";
import { users } from "@/db/auth";
import db from "@/lib/db";
import { count } from "drizzle-orm";

const dailyUserStatement = db
  .select({
    count: count().as("user_count"),
  })
  .from(users)
  .prepare("get_user_count_statement");

export const getUserCount = createServerFn({ method: "GET" }).handler(
  async () => {
    const [{ count }] = await dailyUserStatement.execute();
    return count;
  }
);
