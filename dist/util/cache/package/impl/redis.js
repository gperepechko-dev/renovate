import { regEx } from "../../../regex.js";
import { logger } from "../../../../logger/index.js";
import { parseUrl } from "../../../url.js";
import { compressToBase64 } from "../../../compress.js";
import { PackageCacheBase } from "./base.js";
import { DateTime } from "luxon";
import { RESP_TYPES, createClient, createCluster } from "@redis/client";
//#region lib/util/cache/package/impl/redis.ts
function normalizeRedisUrl(url) {
	return url.replace(regEx(/^(rediss?)\+cluster:\/\//), "$1://");
}
var PackageCacheRedis = class PackageCacheRedis extends PackageCacheBase {
	static async create(url, prefix) {
		const rprefix = prefix ?? "";
		logger.debug("Redis cache init");
		const rewrittenUrl = normalizeRedisUrl(url);
		const clusteredMode = rewrittenUrl !== url;
		const config = {
			url: rewrittenUrl,
			socket: { reconnectStrategy: (retries) => Math.min(retries * 100, 3e3) },
			pingInterval: 3e4
		};
		let client;
		if (clusteredMode) {
			const clusterConfig = { rootNodes: [config] };
			const parsedUrl = parseUrl(rewrittenUrl);
			if (parsedUrl?.username) clusterConfig.defaults = { username: parsedUrl.username };
			if (parsedUrl?.password) {
				clusterConfig.defaults ??= {};
				clusterConfig.defaults.password = parsedUrl.password;
			}
			client = createCluster(clusterConfig);
		} else client = createClient(config);
		await client.connect();
		logger.debug("Redis cache connected");
		const binaryClient = client.withTypeMapping({ [RESP_TYPES.BLOB_STRING]: Buffer });
		return new PackageCacheRedis(client, binaryClient, rprefix);
	}
	client;
	binaryClient;
	rprefix;
	constructor(client, binaryClient, rprefix) {
		super();
		this.client = client;
		this.binaryClient = binaryClient;
		this.rprefix = rprefix;
	}
	getKey(namespace, key) {
		return `${this.rprefix}${namespace}-${key}`;
	}
	async set(namespace, key, value, hardTtlMinutes) {
		logger.trace({
			rprefix: this.rprefix,
			namespace,
			key,
			hardTtlMinutes
		}, "Saving cached value");
		const ttlSeconds = Math.floor(hardTtlMinutes * 60);
		try {
			if (ttlSeconds <= 0) {
				await this.rm(namespace, key);
				return;
			}
			const compressedValue = await compressToBase64(JSON.stringify(value));
			const expiry = DateTime.local().plus({ minutes: hardTtlMinutes });
			const payload = JSON.stringify({
				value: compressedValue,
				expiry
			});
			await this.client.set(this.getKey(namespace, key), payload, { EX: ttlSeconds });
		} catch (err) {
			logger.once.warn({ err }, "Error while setting Redis cache value");
		}
	}
	destroy() {
		try {
			this.client.destroy();
		} catch (err) {
			logger.warn({ err }, "Redis cache destroy failed");
		}
		return Promise.resolve();
	}
	async readRaw(namespace, key) {
		return await this.binaryClient.get(this.getKey(namespace, key)) ?? void 0;
	}
	async rm(namespace, key) {
		logger.trace({
			rprefix: this.rprefix,
			namespace,
			key
		}, "Removing cache entry");
		await this.client.del(this.getKey(namespace, key));
	}
};
//#endregion
export { PackageCacheRedis };

//# sourceMappingURL=redis.js.map