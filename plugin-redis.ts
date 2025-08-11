import "dotenv/config";
import { defineNitroPlugin } from "nitropack/runtime";
import redis from "./src/lib/redis";

export default defineNitroPlugin(async () => {
	console.log("Connecting to Redis...");
	console.log("Redis URL:", process.env.REDIS_URL);
	// if (process.env.BUILD_PHASE !== "1") {
	await redis.connect();
	// }
});
