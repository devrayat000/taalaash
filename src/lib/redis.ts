import { createClient, type RedisClientType } from "redis";

let redis: RedisClientType;

if (typeof window === "undefined") {
	redis = createClient({
		url: process.env.REDIS_URL,
	});

	redis.on("error", (err) => console.error("Redis Client Error", err));
	redis.on("connect", () => console.log("Redis Client Connected"));

	await redis.connect();
} else {
	redis = undefined as unknown as RedisClientType;
}

export default redis;
