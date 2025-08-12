import { denseIndex } from "../src/lib/pinecone";

const WORKER_COUNT = 32;

const workers: Worker[] = [];
const idleWorkers: Worker[] = [];
const jobQueue: any[] = [];

// Wait for queue to drain & all workers idle
async function waitForDrain() {
	while (jobQueue.length > 0 || idleWorkers.length < WORKER_COUNT) {
		await new Promise((r) => setTimeout(r, 20));
	}
}

// Create worker and setup handlers
function createWorker() {
	const w = new Worker("./sync-worker.ts", {
		preload: ["./src/lib/pinecone.ts"],
	});
	w.addEventListener("message", (event) => {
		idleWorkers.push(w);
		pump();
		if ("error" in event.data) {
			console.error("[ERROR]", event.data.i, "[TOKEN]", event.data.next);
		} else {
			console.log("[DONE]", event.data.i, "[TOKEN]", event.data.next);
		}
	});
	w.addEventListener("error", (err) =>
		console.error("Worker error (main):", err),
	);
	return w;
}

// Assign tasks from queue to idle workers
function pump() {
	while (idleWorkers.length && jobQueue.length) {
		const worker = idleWorkers.pop();
		const data = jobQueue.shift();
		worker?.postMessage(data);
	}
}

// Add a job to the queue
function runTask(data: { ids: string[]; next?: string; i: number }) {
	jobQueue.push(data);
	pump();
}

// Init pool
for (let i = 0; i < WORKER_COUNT; i++) {
	const w = createWorker();
	workers.push(w);
	idleWorkers.push(w);
}

const ids = [
	"eyJza2lwX3Bhc3QiOiJiYTA1YTJjMC0xNGQxLTRlODQtYjcxYS01MDQ4NDZkMDIwZGIiLCJwcmVmaXgiOm51bGx9",
	"eyJza2lwX3Bhc3QiOiJmYTE3ZjEzNC1mNGVmLTQyNzAtYmNkZS0xMWZhNzU2N2MyOWMiLCJwcmVmaXgiOm51bGx9",
	"eyJza2lwX3Bhc3QiOiJiYzc0ODI1MC1iYzZhLTQwOWEtOGM2Ny0yNjhiOTQxMzEwMTEiLCJwcmVmaXgiOm51bGx9",
	"eyJza2lwX3Bhc3QiOiJkOWZlYjM4NS0yYzI2LTRkMDYtOTJlMC1kYzBiNGMwMTY4MGMiLCJwcmVmaXgiOm51bGx9",
	"eyJza2lwX3Bhc3QiOiI4NWQ0MGE2NC0zNzQwLTRhMWMtODdlNS1hMTE0NDkxNjUxNGMiLCJwcmVmaXgiOm51bGx9",
];

async function main() {
	let next: string | undefined =
		"eyJza2lwX3Bhc3QiOiI3NDZmM2QxNy00NDBiLTQ1Y2EtOTk0NC05MTc1ZGMxZWU3ZDUiLCJwcmVmaXgiOm51bGx9";
	let i = 0;

	/*do*/ for (const next of ids) {
		try {
			const indexRecords = await denseIndex.listPaginated({
				limit: 96,
				paginationToken: next,
			});

			const ids = indexRecords.vectors
				?.map((p) => p.id)
				.filter(Boolean) as string[];

			if (!ids?.length) {
				continue;
			}
			// next = indexRecords.pagination?.next;

			// console.log("Processing batch:", i);
			// console.log("Next token:", next);
			runTask({ ids, i, next });
			// break;

			// await sparseIndex.upsertRecords(upsert);
		} catch (error) {
			console.error("Error during index sync:", error);
		} finally {
			i++;
			// if (i > 2) {
			// 	break;
			// }
			// break;
		}
	} //while (!!next);

	// Make sure all tasks are done
	await waitForDrain();

	// Only now terminate workers
	await Promise.all(workers.map((w) => w.terminate()));
}

main();
