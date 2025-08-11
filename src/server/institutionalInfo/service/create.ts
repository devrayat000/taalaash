import { z } from "zod/mini";
import db from "@/lib/db";
import { institutionalInfo } from "@/db/schema";

export const saveInstitutionalInfoSchema = z.object({
	hscYear: z.string(),
	college: z.string(),
});

export type SaveInstitutionalInfoInput = z.infer<
	typeof saveInstitutionalInfoSchema
>;

export async function saveInstitutionalInfo(
	params: SaveInstitutionalInfoInput & { userId: string },
) {
	await db.insert(institutionalInfo).values({
		userId: params.userId,
		college: params.college,
		hscYear: params.hscYear,
	});
}
