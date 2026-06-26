import { newlineRegex, regEx } from "../../../../util/regex.js";
import { isNonEmptyString, isString } from "@sindresorhus/is";
import { quote } from "shlex";
//#region lib/modules/manager/npm/post-update/pnpm-maturity.ts
/**
* Parse pnpm's maturity failure from install/update stderr.
*
* Example stderr fragment:
*   ERR_PNPM_NO_MATURE_MATCHING_VERSION  Version 3.0.97 (released 2 days ago) of @ai-sdk/xai does not meet the minimumReleaseAge constraint
*/
function parsePnpmNoMatureMatchingVersions(stderr) {
	if (!isNonEmptyString(stderr)) return [];
	if (!stderr.includes("ERR_PNPM_NO_MATURE_MATCHING_VERSION")) return [];
	const results = [];
	const versionOfPackage = regEx(/Version\s+(\S+)\s+\([^)]*\)\s+of\s+(\S+)\s+does not meet the minimumReleaseAge/i);
	const packageVersionLine = regEx(/^\s+(\S+)\s+was published at\s+/i);
	for (const line of stderr.split(newlineRegex)) {
		const versionOfPackageMatch = versionOfPackage.exec(line);
		if (versionOfPackageMatch) {
			results.push({
				version: versionOfPackageMatch[1],
				packageName: versionOfPackageMatch[2]
			});
			continue;
		}
		const packageVersionLineMatch = packageVersionLine.exec(line);
		if (packageVersionLineMatch) {
			const parsed = splitPackageVersion(packageVersionLineMatch[1]);
			if (parsed) results.push(parsed);
		}
	}
	return dedupePackageVersions(results);
}
function splitPackageVersion(spec) {
	const at = spec.lastIndexOf("@");
	if (at <= 0 || at === spec.length - 1) return null;
	return {
		packageName: spec.slice(0, at),
		version: spec.slice(at + 1)
	};
}
function dedupePackageVersions(versions) {
	const seen = /* @__PURE__ */ new Set();
	const deduped = [];
	for (const version of versions) {
		const key = `${version.packageName}@${version.version}`;
		if (seen.has(key)) continue;
		seen.add(key);
		deduped.push(version);
	}
	return deduped;
}
/**
* True if the existing lockfile already pins this package at this version.
* Accepts lockfile v6+ package keys (`'@scope/pkg@1.2.3':` / `'pkg@1.2.3':`)
* and older path-style keys (`/@scope/pkg@1.2.3(...)` / `/pkg@1.2.3(...)`).
*
* Used to decide whether a maturity failure is for a version **already accepted
* on the base branch** (safe to exclude for regen) vs a **new** selection that
* should stay blocked by minimumReleaseAge.
*/
function lockfileContainsPackageVersion(lockfileContent, packageName, version) {
	if (!isNonEmptyString(lockfileContent) || !isNonEmptyString(packageName)) return false;
	if (!isNonEmptyString(version)) return false;
	const key = `${packageName}@${version}`;
	if (lockfileContent.includes(`'${key}':`) || lockfileContent.includes(`"${key}":`) || lockfileContent.includes(`${key}:`)) return true;
	const escapedName = packageName.replaceAll("/", "\\/");
	if (new RegExp(`(?:^|\\n)\\s*/${escapedName}@${escapeRegExp(version)}(?:[:(]|\\s|$)`, "m").test(lockfileContent)) return true;
	return false;
}
function escapeRegExp(value) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
/**
* Exclude entry in pnpm's minimumReleaseAgeExclude format (`name@version`).
* Scoped packages must not introduce extra `@` in the version segment (pnpm rule).
*/
function toMinimumReleaseAgeExcludeEntry(packageName, version) {
	return `${packageName}@${version}`;
}
/**
* Whether Renovate should retry lockfile generation with a maturity exclude for
* this package@version.
*
* Allow when:
* - version was already in the pre-update lockfile (main already accepted it), or
* - any upgrade in this run is a vulnerability alert for that package targeting
*   this version (security remediations are allowed to bypass age; artifacts may
*   also write workspace excludes, but install can still race/fail first).
*/
function shouldExcludeImmatureVersionForLockfileRetry(opts) {
	const { packageName, version, preUpdateLockfileContent, upgrades } = opts;
	if (lockfileContainsPackageVersion(preUpdateLockfileContent, packageName, version)) return true;
	for (const upgrade of upgrades) {
		if (!upgrade.isVulnerabilityAlert) continue;
		const upgradeName = upgrade.packageName ?? upgrade.depName;
		if (!isString(upgradeName) || upgradeName !== packageName) continue;
		const target = upgrade.newVersion ?? upgrade.newValue;
		if (isString(target) && target === version) return true;
	}
	return false;
}
/**
* Append pnpm CLI config flags so listed package@versions bypass minimumReleaseAge
* for this install only (does not mutate pnpm-workspace.yaml).
*
* Uses repeated `--config.minimumReleaseAgeExclude[]=` entries (pnpm config arrays).
*/
function appendPnpmMinimumReleaseAgeExcludeFlags(command, excludes) {
	if (!excludes.length) return command;
	return `${command} ${excludes.map((entry) => `--config.minimumReleaseAgeExclude[]=${quote(entry)}`).join(" ")}`;
}
/**
* Map commands through appendPnpmMinimumReleaseAgeExcludeFlags.
*/
function getPnpmWorkspaceMaturityExcludes(pnpmWorkspace) {
	return pnpmWorkspace?.minimumReleaseAgeExclude?.filter(isNonEmptyString) ?? [];
}
function withPnpmMaturityExcludes(commands, excludes, existingExcludes = []) {
	if (!excludes.length) return commands;
	return commands.map((cmd) => appendPnpmMinimumReleaseAgeExcludeFlags(cmd, [...existingExcludes, ...excludes]));
}
//#endregion
export { getPnpmWorkspaceMaturityExcludes, parsePnpmNoMatureMatchingVersions, shouldExcludeImmatureVersionForLockfileRetry, toMinimumReleaseAgeExcludeEntry, withPnpmMaturityExcludes };

//# sourceMappingURL=pnpm-maturity.js.map