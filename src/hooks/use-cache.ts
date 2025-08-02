import { hashKey } from "@tanstack/react-query";
import redis from "@/lib/redis";

type CacheOptions = {
	ttl?: number; // Time to live in seconds
	tags?: string[]; // Tags for cache invalidation
};

export type UseCacheOptions<T extends (...args: any[]) => any> = [
	fn: T,
	options?: CacheOptions,
];

export function useCache<T extends (...args: any[]) => any>(
	...options: UseCacheOptions<T>
) {
	return async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
		const [fn, opts] = options;
		const cacheKey = hashKey([fn.name, ...args]);
		const cachedValue = await redis.get(cacheKey);

		if (cachedValue) {
			return JSON.parse(cachedValue) as Awaited<ReturnType<T>>;
		}

		const result = await fn(...args);
		await redis.set(cacheKey, JSON.stringify(result), {
			EX: opts?.ttl ?? 60 * 60, // Cache for 1 hour
		});

		if (opts?.tags) {
			for (const tag of opts.tags) {
				await redis.sAdd(`cache:tag:${tag}`, cacheKey);
			}
		}

		return result;
	};
}

export async function invalidateTags(...tags: string[]) {
	if (tags.length === 0) return;

	const keys = await redis.sMembers(`cache:tags:${tags.join(",")}`);
	if (keys.length > 0) {
		await redis.del(keys);
	}
}

export async function clearCache() {
	await redis.flushAll();
	console.log("Cache cleared");
}
