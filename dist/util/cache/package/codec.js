import { decompressFromBuffer } from "../../compress.js";
import { DateTime } from "luxon";
//#region lib/util/cache/package/codec.ts
const headerLength = 8;
const prefixWord = 294715648;
/**
* Format detection must not collide with anything older Renovate versions
* stored. Legacy entries are either JSON wrappers, which always start with `{`
* (`0x7b`), or raw brotli blobs from the SQLite backend.
*
* Brotli streams start with the WBITS field (RFC 7932, section 9.1). Standard
* brotli reserves `0010001` as an invalid bit pattern. The only byte values
* whose low seven bits match that pattern are `0x11` and `0x91`, so no valid
* legacy brotli stream can start with either byte.
*
* This does not account for `BROTLI_PARAM_LARGE_WINDOW`, which Renovate has
* never enabled. Both bytes also fall outside the base64 alphabet and printable
* JSON, giving the prefix extra margin against other legacy-looking payloads.
*/
const magic0 = 17;
const magic1 = 145;
function isEnvelope(data) {
	return data[0] === magic0 && data[1] === magic1;
}
async function decodeEntry(data) {
	if (data.length < headerLength) throw new Error("Truncated package cache entry");
	if (data.readUInt32BE(0) !== prefixWord) throw new Error("Unsupported package cache format");
	const cachedAtSeconds = data.readUInt32BE(4);
	const json = await decompressFromBuffer(data.subarray(headerLength));
	return {
		value: JSON.parse(json),
		cachedAt: DateTime.fromSeconds(cachedAtSeconds)
	};
}
//#endregion
export { decodeEntry, isEnvelope };

//# sourceMappingURL=codec.js.map