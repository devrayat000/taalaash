import {
	type Index,
	Pinecone,
	type RecordMetadata,
} from "@pinecone-database/pinecone";

declare global {
	var pc: Pinecone | undefined;
	var pci: Index<RecordMetadata> | undefined;
}

const pinecone =
	globalThis.pc ??
	new Pinecone({
		apiKey: process.env.PINECONE_API_KEY || "",
		// fetchApi: fetchWithEvent,
	});

const pineconeIndex =
	globalThis.pci ??
	pinecone.Index(process.env.PINECONE_INDEX_NAME || "taalaash");

if (process.env.NODE_ENV !== "production") {
	globalThis.pc = pinecone;
	globalThis.pci = pineconeIndex;
}

export { pinecone, pineconeIndex };
