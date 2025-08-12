import { denseIndex, sparseIndex } from "./src/lib/pinecone";

async function main() {
	let next: string | undefined = undefined;

	do {
		const indexRecords = await denseIndex.listPaginated({
			limit: 2,
			paginationToken: next,
		});

		if (indexRecords.pagination?.next) {
			const records = await denseIndex.fetch(
				indexRecords.vectors?.map((p) => p.id),
			);
			const upsert = Object.values(records.records).map(
				(record) => record.metadata,
			);
			console.log(upsert);

			// await sparseIndex.upsertRecords(upsert);
			break;
		}
		next = indexRecords.pagination?.next;
	} while (!!next);
}

main();
