"use server";

import { redirect } from "next/navigation";

import { searchHistory } from "@/db/schema";
import { auth } from "@/lib/auth";
import db from "@/lib/db";

export async function addToHistory(_: string, query: string) {
  const session = await auth();
  if (!session) {
    redirect("/signin");
  }

  await db.insert(searchHistory).values({ query, userId: session.user.id });
  return query;
}
