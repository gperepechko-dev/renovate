import { escapeRegExp, regEx } from "../../../util/regex.js";
import "../../versioning/npm/index.js";
import { id } from "../../versioning/conda/index.js";
import { DockerDatasource } from "../../datasource/docker/index.js";
import { GithubReleasesDatasource } from "../../datasource/github-releases/index.js";
import { NpmDatasource } from "../../datasource/npm/index.js";
import { PypiDatasource } from "../../datasource/pypi/index.js";
import { RubyVersionDatasource } from "../../datasource/ruby-version/index.js";
import { RustVersionDatasource } from "../../datasource/rust-version/index.js";
import { z } from "zod/v4";
//#region lib/modules/manager/github-actions/community.ts
function actionSchema(name, { isInvalid, withSchema, ...cfg }) {
	return z.object({
		uses: matchAction(name),
		with: withSchema ?? VersionVal
	}).transform(({ with: { val, ...meta } }) => ({
		...cfg,
		...meta,
		...parseValue(val, isInvalid)
	})).transform((dep) => {
		dep.depName ??= dep.packageName;
		return dep;
	});
}
function matchAction(action) {
	return z.string().regex(regEx(`(?:https?://[^/]+/)?${escapeRegExp(action)}(?:@.+)?$`));
}
function parseValue(currentValue, isInvalid) {
	if (!currentValue) return {
		skipStage: "extract",
		skipReason: "unspecified-version",
		depType: "uses-with"
	};
	if (isInvalid?.(currentValue) === true) return {
		skipStage: "extract",
		skipReason: "invalid-version",
		depType: "uses-with",
		currentValue
	};
	return {
		currentValue,
		depType: "uses-with"
	};
}
function valSchema(key) {
	return z.object({ [key]: z.string().optional() }).transform((val) => ({ val: val[key] }));
}
const VersionVal = z.object({ version: z.string().optional() }).transform((val) => ({ val: val.version }));
const InstallBinaryWith = z.object({
	repo: z.string(),
	tag: z.string()
}).transform(({ repo, tag }) => ({
	packageName: repo,
	val: tag
}));
/**
* Community contributed actions with known version input schemas.
*/
const communityActions = {
	"aquasecurity/setup-trivy": {
		datasource: GithubReleasesDatasource.id,
		packageName: "aquasecurity/trivy"
	},
	"aquasecurity/trivy-action": {
		datasource: GithubReleasesDatasource.id,
		packageName: "aquasecurity/trivy"
	},
	"astral-sh/setup-uv": {
		datasource: GithubReleasesDatasource.id,
		versioning: "npm",
		packageName: "astral-sh/uv"
	},
	"azure/setup-helm": {
		datasource: GithubReleasesDatasource.id,
		depName: "helm",
		packageName: "helm/helm"
	},
	"denoland/setup-deno": {
		datasource: NpmDatasource.id,
		packageName: "deno",
		withSchema: valSchema("deno-version")
	},
	"docker/setup-buildx-action": {
		datasource: GithubReleasesDatasource.id,
		depName: "buildx",
		packageName: "docker/buildx"
	},
	"docker/setup-compose-action": {
		datasource: GithubReleasesDatasource.id,
		packageName: "docker/compose"
	},
	"docker/setup-docker-action": {
		datasource: GithubReleasesDatasource.id,
		depName: "docker",
		packageName: "moby/moby",
		extractVersion: "^docker-(?<version>.+)$"
	},
	"dtolnay/rust-toolchain": {
		datasource: RustVersionDatasource.id,
		packageName: "rust",
		withSchema: valSchema("toolchain")
	},
	"golangci/golangci-lint-action": {
		datasource: GithubReleasesDatasource.id,
		packageName: "golangci/golangci-lint"
	},
	"helm/chart-testing-action": {
		datasource: GithubReleasesDatasource.id,
		depName: "chart-testing",
		packageName: "helm/chart-testing"
	},
	"jakebailey/pyright-action": {
		datasource: NpmDatasource.id,
		packageName: "pyright",
		isInvalid: (val) => val === "PATH"
	},
	"jaxxstorm/action-install-gh-release": {
		datasource: GithubReleasesDatasource.id,
		packageName: "",
		withSchema: InstallBinaryWith
	},
	"oven-sh/setup-bun": {
		datasource: NpmDatasource.id,
		packageName: "bun",
		withSchema: valSchema("bun-version")
	},
	"pdm-project/setup-pdm": {
		datasource: PypiDatasource.id,
		packageName: "pdm"
	},
	"pnpm/action-setup": {
		datasource: NpmDatasource.id,
		packageName: "pnpm"
	},
	"prefix-dev/setup-pixi": {
		datasource: GithubReleasesDatasource.id,
		versioning: id,
		packageName: "prefix-dev/pixi",
		withSchema: valSchema("pixi-version")
	},
	"pypa/hatch": {
		datasource: GithubReleasesDatasource.id,
		packageName: "pypa/hatch",
		extractVersion: "^hatch-(?<version>.+)$"
	},
	"ruby/setup-ruby": {
		datasource: RubyVersionDatasource.id,
		packageName: "ruby",
		withSchema: valSchema("ruby-version")
	},
	"sigoden/install-binary": {
		datasource: GithubReleasesDatasource.id,
		packageName: "",
		withSchema: InstallBinaryWith
	},
	"zizmorcore/zizmor-action": {
		datasource: DockerDatasource.id,
		packageName: "ghcr.io/zizmorcore/zizmor"
	}
};
const CommunityActions = z.union(Object.entries(communityActions).map(([name, cfg]) => actionSchema(name, cfg)));
//#endregion
export { CommunityActions };

//# sourceMappingURL=community.js.map