import { DeepNullish } from "../../../util/schema-utils/index.js";
import { z } from "zod/v4";
//#region lib/modules/datasource/pypi/schema.ts
const PypiRelease = DeepNullish(z.object({
	requires_python: z.string().optional(),
	upload_time: z.string().optional(),
	yanked: z.boolean().optional().default(false)
}));
const PypiResponse = DeepNullish(z.object({
	info: z.object({
		name: z.string().optional(),
		home_page: z.string().optional(),
		project_urls: z.record(z.string(), z.string().optional()).optional()
	}).optional(),
	releases: z.record(z.string(), z.array(PypiRelease)).optional()
}));
//#endregion
export { PypiResponse };

//# sourceMappingURL=schema.js.map