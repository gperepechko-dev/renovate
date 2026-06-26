import { LooseArray } from "../../../util/schema-utils/index.js";
import { z } from "zod/v4";
//#region lib/modules/datasource/java-version/schema.ts
const AdoptiumJavaVersion = z.object({ semver: z.string() });
const AdoptiumJavaResponse = z.object({ versions: LooseArray(AdoptiumJavaVersion).optional() });
//#endregion
export { AdoptiumJavaResponse };

//# sourceMappingURL=schema.js.map