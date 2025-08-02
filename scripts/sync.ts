import db from "../src/lib/db";
import { pineconeIndex } from "../src/lib/pinecone";

async function getSeparateIds() {
	const dbRecords = await db.query.post.findMany({
		columns: { id: true },
		// limit: 500,
	});
	const dbIds = new Set(dbRecords.map((record) => record.id));

	let next: string | undefined = undefined;
	const pineconeIds: string[][] = [];

	do {
		const indexRecords = await pineconeIndex.listPaginated({
			limit: 100,
			paginationToken: next,
		});
		const indexIds = indexRecords.vectors?.map((record) => record.id);
		next = indexRecords.pagination?.next;

		if (indexIds) {
			pineconeIds.push(indexIds as string[]);
		}
	} while (!!next);

	const indexIds = new Set(pineconeIds.flat());

	// find the ids that are in the index but not in the db using set operations
	const separateIds = indexIds.difference(dbIds);

	const dbOnlyIds = dbIds.difference(indexIds);

	return {
		separateIds: Array.from(separateIds),
		dbOnlyIds: Array.from(dbOnlyIds),
	};
}

async function sync() {
	const { separateIds, dbOnlyIds } = await getSeparateIds();

	// Sync logic here
	console.log("IDs in Pinecone but not in DB:", separateIds.length);
	console.log("IDs in DB but not in Pinecone:", dbOnlyIds.length);

	// Delete IDs that are not in the DB but are in Pinecone
	if (dbOnlyIds.length > 0) {
		await pineconeIndex.deleteMany(separateIds);
	}

	// // Add the dbOnly IDs to Pinecone
	// if (dbOnlyIds.length > 0) {
	//     const docs = dbOnlyIds.map((id) => ({
	//         id,
	//         text: "", // Assuming text is empty for these records
	//         chapter: "",
	//         book: "",
	//         subject: "",
	//         edition: "",
	//     }));
	//     await pineconeIndex.upsertRecords(docs);
	// }
}

await sync();
process.exit(0);
