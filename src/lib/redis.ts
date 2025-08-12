import { createClient } from "redis";

const redis = createClient({
	url: process.env.REDIS_URL,
	// url: "redis://localhost:6379",
	// socket: {},
});
// redis.isReady;
redis.on("error", (err) => console.error("Redis Client Error", err));
redis.on("connect", () => console.log("Redis Client Connected"));

redis.on("end", () => {
	console.warn("[redis] connection ended; marking client closed");
});

// if (process.env.DEV) {
// 	await redis.connect();
// }

export default redis;
