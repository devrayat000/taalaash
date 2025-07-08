import cluster from "node:cluster";
import os from "node:os";

if (cluster.isPrimary) {
	const numCPUs = Math.floor(os.cpus().length / 2);
	for (let i = 0; i < numCPUs; i++) {
		cluster.fork();
	}
} else {
	import("./.output/server/index.mjs").catch((err) => {
		console.error("Error starting server:", err);
		process.exit(1);
	});
}
