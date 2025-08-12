import { sparseIndex, denseIndex } from "../src/lib/pinecone";

// prevents TS errors
declare var self: Worker;

self.onmessage = async (event: MessageEvent) => {
	try {
		const records = await denseIndex.fetch(event.data.ids);

		const upsert = Object.values(records.records)
			.map((record) => {
				if (!record.metadata) {
					return null;
				}
				return Object.assign(record.metadata, { id: record.id });
			})
			.filter(Boolean) as Record<string, any>[];

		await sparseIndex.upsertRecords(upsert);
		self.postMessage(event.data);
	} catch (error) {
		self.postMessage({ ...event.data, error: error.message });
	}
	//   postMessage("world");
};

self.onerror = (error) => {
	console.error("Worker error (worker):", error);
};
