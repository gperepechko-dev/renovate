import { LooseArray } from "../../../util/schema-utils/index.js";
import { z } from "zod/v4";
const GradleReleases = LooseArray(z.object({
	buildTime: z.string().optional(),
	broken: z.boolean().optional(),
	milestoneFor: z.string().optional(),
	nightly: z.boolean().optional(),
	rcFor: z.string().optional(),
	snapshot: z.boolean().optional(),
	version: z.string()
}));
//#endregion
export { GradleReleases };

//# sourceMappingURL=schema.js.map