import { LooseArray } from "../../../util/schema-utils/index.js";
import { z } from "zod/v4";
const NodeReleases = LooseArray(z.object({
	/** node version */
	version: z.string(),
	/** release date */
	date: z.string().optional(),
	/** Is LTS release */
	lts: z.union([z.literal(false), z.string()])
}));
//#endregion
export { NodeReleases };

//# sourceMappingURL=schema.js.map