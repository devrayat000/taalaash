"use server";

import { redirect } from "next/navigation";

import db from "@/lib/db";
import { institutionalInfo } from "@/db/schema";
import { auth } from "@/lib/auth";
import { sql } from "drizzle-orm";

const saveInfo = db
  .insert(institutionalInfo)
  .values({
    userId: sql.placeholder("userId"),
    college: sql.placeholder("college"),
    hscYear: sql.placeholder("hscYear"),
  })
  //   .returning()
  .prepare("save_institutional_info");

export async function saveInstitutionalInfo(data: {
  hscYear: string;
  college: string;
}) {
  const session = await auth();
  if (!session) {
    redirect("/signin");
  }

  await saveInfo.execute({ userId: session.user.id, ...data });
}
