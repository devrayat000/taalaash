import {
	type Index,
	Pinecone,
	type RecordMetadata,
} from "@pinecone-database/pinecone";

declare global {
	var pc: Pinecone | undefined;
	var pcdi: Index<RecordMetadata> | undefined;
	var pcsi: Index<RecordMetadata> | undefined;
}

const pinecone =
	globalThis.pc ??
	new Pinecone({
		apiKey: process.env.PINECONE_API_KEY || "",
		// fetchApi: fetchWithEvent,
	});

const denseIndex =
	globalThis.pcdi ??
	pinecone.Index(process.env.PINECONE_DENSE_INDEX_NAME || "taalaash");

const sparseIndex =
	globalThis.pcsi ??
	pinecone.Index(process.env.PINECONE_SPARSE_INDEX_NAME || "taalaash");

if (process.env.NODE_ENV !== "production") {
	globalThis.pc = pinecone;
	globalThis.pcdi = denseIndex;
	globalThis.pcsi = sparseIndex;
}

export { pinecone, denseIndex, sparseIndex };
