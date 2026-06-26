import { logger } from "../../../../logger/index.js";
import { decodeEntry, isEnvelope } from "../codec.js";
import { decodeLegacyEntry } from "../legacy.js";
import { DateTime } from "luxon";
//#region lib/util/cache/package/impl/base.ts
var PackageCacheBase = class {
	async get(namespace, key) {
		let raw;
		try {
			raw = await this.readRaw(namespace, key);
		} catch (err) {
			logger.once.debug({ err }, "Error while reading package cache value");
			return;
		}
		if (!raw) {
			logger.trace({
				namespace,
				key
			}, "Cache miss");
			return;
		}
		try {
			if (isEnvelope(raw)) {
				const entry = await decodeEntry(raw);
				logger.trace({
					namespace,
					key
				}, "Returning cached value");
				return entry.value;
			}
			const entry = await decodeLegacyEntry(raw);
			if (isExpiredLegacyEntry(entry)) {
				await this.removeInvalidEntry(namespace, key);
				return;
			}
			logger.trace({
				namespace,
				key
			}, "Returning cached value");
			return entry.value;
		} catch (err) {
			logger.once.debug({ err }, "Error while reading package cache value");
			await this.removeInvalidEntry(namespace, key);
			return;
		}
	}
	async removeInvalidEntry(namespace, key) {
		try {
			await this.rm(namespace, key);
		} catch (err) {
			logger.once.debug({ err }, "Error while removing package cache value");
		}
	}
};
function isExpiredLegacyEntry(entry) {
	const { expiry } = entry;
	return expiry !== void 0 && (!expiry.isValid || DateTime.local() >= expiry);
}
//#endregion
export { PackageCacheBase };

//# sourceMappingURL=base.js.map