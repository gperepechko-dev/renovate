import { LooseArray } from "../../../util/schema-utils/index.js";
import { MaybeTimestamp } from "../../../util/timestamp.js";
import { z } from "zod/v4";
//#region lib/modules/datasource/puppet-forge/schema.ts
const PuppetReleaseAbbreviated = z.object({
	version: z.string(),
	created_at: MaybeTimestamp,
	file_uri: z.string().optional().nullable()
}).transform(({ version, created_at, file_uri }) => {
	const release = { version };
	if (file_uri) release.downloadUrl = file_uri;
	if (created_at) release.releaseTimestamp = created_at;
	return release;
});
const PuppetModule = z.object({
	releases: LooseArray(PuppetReleaseAbbreviated).default([]),
	homepage_url: z.string().optional().nullable(),
	deprecated_for: z.string().optional().nullable()
}).transform((module) => {
	const result = { releases: module.releases };
	if (module.homepage_url) result.homepage = module.homepage_url;
	if (module.deprecated_for) result.deprecationMessage = module.deprecated_for;
	return result;
});
//#endregion
export { PuppetModule };

//# sourceMappingURL=schema.js.map