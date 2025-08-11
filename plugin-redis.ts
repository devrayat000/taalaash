import { defineNitroPlugin } from "nitropack/runtime";
import redis from "./src/lib/redis";

export default defineNitroPlugin(async () => {
	await redis.connect();
});
