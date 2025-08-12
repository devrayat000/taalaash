import { defineNitroPlugin } from "nitropack/runtime";
import redis from "./src/lib/redis";

export default defineNitroPlugin(async (app) => {
	console.log("Connecting to Redis...");
	console.log("Redis URL:", process.env.REDIS_URL);

	if (!redis.isReady) {
		redis.connect();
	}

	app.hooks.hook("close", () => {
		redis.quit();
	});
});
