import { MaybeTimestamp } from "../../../util/timestamp.js";
import { z } from "zod/v4";
//#region lib/modules/datasource/go/schema.ts
const VersionInfo = z.object({
	Version: z.string(),
	Time: MaybeTimestamp
});
//#endregion
export { VersionInfo };

//# sourceMappingURL=schema.js.map