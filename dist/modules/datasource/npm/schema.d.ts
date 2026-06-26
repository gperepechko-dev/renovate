import { z } from "zod/v4";

//#region lib/modules/datasource/npm/schema.d.ts
declare const NpmResponseVersion: z.ZodObject<{
  repository: z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodUnknown, z.ZodTransform<any, unknown>>, z.ZodUnion<readonly [z.ZodString, z.ZodObject<{
    url: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    directory: z.ZodOptional<z.ZodNullable<z.ZodString>>;
  }, z.core.$strip>]>>>;
  homepage: z.ZodCatch<z.ZodOptional<z.ZodString>>;
  deprecated: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodBoolean]>>;
  gitHead: z.ZodOptional<z.ZodString>;
  dependencies: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
  devDependencies: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
  engines: z.ZodCatch<z.ZodOptional<z.ZodObject<{
    node: z.ZodOptional<z.ZodString>;
  }, z.core.$strip>>>;
  dist: z.ZodOptional<z.ZodObject<{
    attestations: z.ZodOptional<z.ZodObject<{
      url: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
  }, z.core.$strip>>;
}, z.core.$strip>;
type NpmResponseVersion = z.infer<typeof NpmResponseVersion>;
declare const CachedPackument: z.ZodObject<{
  versions: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
    repository: z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodUnknown, z.ZodTransform<any, unknown>>, z.ZodUnion<readonly [z.ZodString, z.ZodObject<{
      url: z.ZodOptional<z.ZodNullable<z.ZodString>>;
      directory: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>]>>>;
    homepage: z.ZodCatch<z.ZodOptional<z.ZodString>>;
    deprecated: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodBoolean]>>;
    gitHead: z.ZodOptional<z.ZodString>;
    dependencies: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    devDependencies: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    engines: z.ZodCatch<z.ZodOptional<z.ZodObject<{
      node: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
    dist: z.ZodOptional<z.ZodObject<{
      attestations: z.ZodOptional<z.ZodObject<{
        url: z.ZodOptional<z.ZodString>;
      }, z.core.$strip>>;
    }, z.core.$strip>>;
  }, z.core.$strip>>>;
  repository: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodObject<{
    url: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    directory: z.ZodOptional<z.ZodNullable<z.ZodString>>;
  }, z.core.$strip>]>>;
  homepage: z.ZodOptional<z.ZodString>;
  time: z.ZodOptional<z.ZodType<Record<string, string>, any, z.core.$ZodTypeInternals<Record<string, string>, any>>>;
  'dist-tags': z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
}, z.core.$strip>;
declare const NpmResponse: z.ZodObject<{
  _id: z.ZodOptional<z.ZodString>;
  name: z.ZodOptional<z.ZodString>;
  versions: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
    repository: z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodUnknown, z.ZodTransform<any, unknown>>, z.ZodUnion<readonly [z.ZodString, z.ZodObject<{
      url: z.ZodOptional<z.ZodNullable<z.ZodString>>;
      directory: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>]>>>;
    homepage: z.ZodCatch<z.ZodOptional<z.ZodString>>;
    deprecated: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodBoolean]>>;
    gitHead: z.ZodOptional<z.ZodString>;
    dependencies: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    devDependencies: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    engines: z.ZodCatch<z.ZodOptional<z.ZodObject<{
      node: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
    dist: z.ZodOptional<z.ZodObject<{
      attestations: z.ZodOptional<z.ZodObject<{
        url: z.ZodOptional<z.ZodString>;
      }, z.core.$strip>>;
    }, z.core.$strip>>;
  }, z.core.$loose>>>;
  repository: z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodUnknown, z.ZodTransform<any, unknown>>, z.ZodUnion<readonly [z.ZodString, z.ZodObject<{
    url: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    directory: z.ZodOptional<z.ZodNullable<z.ZodString>>;
  }, z.core.$strip>]>>>;
  homepage: z.ZodOptional<z.ZodString>;
  time: z.ZodOptional<z.ZodType<Record<string, string>, any, z.core.$ZodTypeInternals<Record<string, string>, any>>>;
  'dist-tags': z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
}, z.core.$strip>;
type NpmResponse = z.infer<typeof NpmResponse>;
//#endregion
export { CachedPackument, NpmResponse, NpmResponseVersion };
//# sourceMappingURL=schema.d.ts.map