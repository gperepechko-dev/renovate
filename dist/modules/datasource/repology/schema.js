import { LooseArray } from "../../../util/schema-utils/index.js";
import { z } from "zod/v4";
const RepologyPackages = LooseArray(z.object({
	repo: z.string(),
	visiblename: z.string(),
	version: z.string(),
	srcname: z.string().nullable().optional(),
	binname: z.string().nullable().optional(),
	origversion: z.string().nullable().optional()
})).catch([]);
//#endregion
export { RepologyPackages };

//# sourceMappingURL=schema.js.map