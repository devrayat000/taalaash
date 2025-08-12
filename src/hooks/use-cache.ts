import { hashKey } from "@tanstack/react-query";
import { serverOnly } from "@tanstack/react-start";
import redis from "@/lib/redis";

type CacheOptions<Args extends any[]> = {
	ttl?: number; // Time to live in seconds
	tags?: string[] | ((...args: Args) => string[]); // Tags for cache invalidation
	prefix?: string;
};

export type UseCacheOptions<T extends (...args: any[]) => any> = [
	fn: T,
	options?: CacheOptions<Parameters<T>>,
];

type CacheMeta = {
	ttl: number;
	hit: boolean;
};

type WithCacheResult<T> = {
	data: T;
	__meta: CacheMeta;
};

export function withCache<T extends (...args: any[]) => any>(
	...options: UseCacheOptions<T>
) {
	return serverOnly(
		async (
			...args: Parameters<T>
		): Promise<WithCacheResult<Awaited<ReturnType<T>>>> => {
			if (!redis.isReady) {
				await redis.connect();
			}

			const [fn, opts] = options;
			const cacheHash = hashKey([fn.name, ...args]);
			const cacheKey = `cache:${opts?.prefix || "default"}:${cacheHash}`;

			const cachedValue = await redis.get(cacheKey);
			if (cachedValue) {
				const ttl = await redis.ttl(cacheKey);
				const data = JSON.parse(cachedValue) as Awaited<ReturnType<T>>;
				return {
					data,
					__meta: {
						ttl,
						hit: true,
					},
				};
			}

			const result = await fn(...args);
			const ttl = opts?.ttl ?? 60 * 60;

			await redis.set(cacheKey, JSON.stringify(result), { EX: ttl });

			if (opts?.tags) {
				const tags =
					typeof opts.tags === "function" ? opts.tags(...args) : opts.tags;
				for (const tag of tags) {
					await redis.sAdd(`cache:tag:${tag}`, cacheKey);
				}
			}

			return {
				data: result,
				__meta: {
					ttl,
					hit: false,
				},
			};
		},
	);
}

export const invalidateTags = serverOnly(async (...tags: string[]) => {
	if (tags.length === 0) return;

	const keys = await redis.sMembers(`cache:tags:${tags.join(",")}`);
	if (keys.length > 0) {
		await redis.del(keys);
	}
});

export const clearCache = serverOnly(async () => {
	await redis.flushAll();
	console.log("Cache cleared");
});
