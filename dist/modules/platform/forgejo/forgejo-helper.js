import { logger } from "../../../logger/index.js";
import { getQueryString } from "../../../util/url.js";
import { getCache } from "../../../util/cache/repository/index.js";
import { ForgejoHttp } from "../../../util/http/forgejo.js";
import { Comment, CommitStatus, Issue, Label, PR, Repo, RepoContents, RepoSearchResults, User, Version } from "./schema.js";
import { API_PATH } from "./utils.js";
import { isBoolean } from "@sindresorhus/is";
import { z } from "zod/v4";
//#region lib/modules/platform/forgejo/forgejo-helper.ts
const forgejoHttp = new ForgejoHttp();
const urlEscape = (raw) => encodeURIComponent(raw);
const commitStatusStates = [
	"unknown",
	"success",
	"pending",
	"warning",
	"failure",
	"error"
];
async function getCurrentUser(options = {}) {
	const url = `${API_PATH}/user`;
	return (await forgejoHttp.getJson(url, options, User)).body;
}
async function getVersion(options = {}) {
	const url = `${API_PATH}/version`;
	return (await forgejoHttp.getJson(url, options, Version)).body.version;
}
async function isOrg(organization) {
	const repoCache = getCache();
	repoCache.platform ??= {};
	repoCache.platform.forgejo ??= {};
	repoCache.platform.forgejo.orgs ??= {};
	const cached = repoCache.platform.forgejo.orgs[organization];
	if (isBoolean(cached)) return cached;
	try {
		const url = `${API_PATH}/orgs/${organization}`;
		const res = await forgejoHttp.getJsonUnchecked(url);
		repoCache.platform.forgejo.orgs[organization] = res.statusCode === 200;
		return res.statusCode === 200;
	} catch (err) {
		if (err.statusCode === 404) return false;
		throw err;
	}
}
async function searchRepos(params, options) {
	const url = `${API_PATH}/repos/search?${getQueryString(params)}`;
	const res = await forgejoHttp.getJson(url, {
		...options,
		paginate: true
	}, RepoSearchResults);
	if (!res.body.ok) throw new Error("Unable to search for repositories, ok flag has not been set");
	return res.body.data;
}
async function orgListRepos(organization, options) {
	const url = `${API_PATH}/orgs/${organization}/repos`;
	return (await forgejoHttp.getJson(url, {
		...options,
		paginate: true
	}, z.array(Repo))).body;
}
async function getRepo(repoPath, options = {}) {
	const url = `${API_PATH}/repos/${repoPath}`;
	return (await forgejoHttp.getJson(url, options, Repo)).body;
}
async function getRepoContents(repoPath, filePath, ref, options = {}) {
	const query = getQueryString(ref ? { ref } : {});
	const url = `${API_PATH}/repos/${repoPath}/contents/${urlEscape(filePath)}?${query}`;
	return (await forgejoHttp.getJson(url, options, RepoContents)).body;
}
async function createPR(repoPath, params, options) {
	const url = `${API_PATH}/repos/${repoPath}/pulls`;
	return (await forgejoHttp.postJson(url, {
		...options,
		body: params
	}, PR)).body;
}
async function updatePR(repoPath, idx, params, options) {
	const url = `${API_PATH}/repos/${repoPath}/pulls/${idx}`;
	return (await forgejoHttp.patchJson(url, {
		...options,
		body: params
	}, PR)).body;
}
async function mergePR(repoPath, idx, params, options) {
	const url = `${API_PATH}/repos/${repoPath}/pulls/${idx}/merge`;
	await forgejoHttp.postJson(url, {
		...options,
		body: params
	});
}
async function getPR(repoPath, idx, options = {}) {
	const url = `${API_PATH}/repos/${repoPath}/pulls/${idx}`;
	return (await forgejoHttp.getJson(url, options, PR)).body;
}
async function getPRByBranch(repoPath, base, head, options = {}) {
	const url = `${API_PATH}/repos/${repoPath}/pulls/${base}/${head}`;
	try {
		return (await forgejoHttp.getJson(url, options, PR)).body;
	} catch (err) {
		logger.trace({ err }, "Error while fetching PR");
		if (err.statusCode !== 404) logger.debug({ err }, "Error while fetching PR");
		return null;
	}
}
async function requestPrReviewers(repoPath, idx, params, options) {
	const url = `${API_PATH}/repos/${repoPath}/pulls/${idx}/requested_reviewers`;
	await forgejoHttp.postJson(url, {
		...options,
		body: params
	});
}
async function createIssue(repoPath, params, options) {
	const url = `${API_PATH}/repos/${repoPath}/issues`;
	return (await forgejoHttp.postJson(url, {
		...options,
		body: params
	}, Issue)).body;
}
async function updateIssue(repoPath, idx, params, options) {
	const url = `${API_PATH}/repos/${repoPath}/issues/${idx}`;
	return (await forgejoHttp.patchJson(url, {
		...options,
		body: params
	}, Issue)).body;
}
async function updateIssueLabels(repoPath, idx, params, options) {
	const url = `${API_PATH}/repos/${repoPath}/issues/${idx}/labels`;
	return (await forgejoHttp.putJson(url, {
		...options,
		body: params
	}, z.array(Label))).body;
}
async function closeIssue(repoPath, idx, options) {
	await updateIssue(repoPath, idx, {
		...options,
		state: "closed"
	});
}
async function searchIssues(repoPath, params, options) {
	const url = `${API_PATH}/repos/${repoPath}/issues?${getQueryString({
		...params,
		type: "issues"
	})}`;
	return (await forgejoHttp.getJson(url, {
		...options,
		paginate: true
	}, z.array(Issue))).body;
}
async function getIssue(repoPath, idx, options = {}) {
	const url = `${API_PATH}/repos/${repoPath}/issues/${idx}`;
	return (await forgejoHttp.getJson(url, options, Issue)).body;
}
async function getRepoLabels(repoPath, options = {}) {
	const url = `${API_PATH}/repos/${repoPath}/labels`;
	return (await forgejoHttp.getJson(url, options, z.array(Label))).body;
}
async function getOrgLabels(orgName, options = {}) {
	const url = `${API_PATH}/orgs/${orgName}/labels`;
	return (await forgejoHttp.getJson(url, options, z.array(Label))).body;
}
async function unassignLabel(repoPath, issue, label, options) {
	const url = `${API_PATH}/repos/${repoPath}/issues/${issue}/labels/${label}`;
	await forgejoHttp.deleteJson(url, options);
}
async function createComment(repoPath, issue, body, options) {
	const params = { body };
	const url = `${API_PATH}/repos/${repoPath}/issues/${issue}/comments`;
	return (await forgejoHttp.postJson(url, {
		...options,
		body: params
	}, Comment)).body;
}
async function updateComment(repoPath, idx, body, options) {
	const params = { body };
	const url = `${API_PATH}/repos/${repoPath}/issues/comments/${idx}`;
	return (await forgejoHttp.patchJson(url, {
		...options,
		body: params
	}, Comment)).body;
}
async function deleteComment(repoPath, idx, options) {
	const url = `${API_PATH}/repos/${repoPath}/issues/comments/${idx}`;
	await forgejoHttp.deleteJson(url, options);
}
async function getComments(repoPath, issue, options = {}) {
	const url = `${API_PATH}/repos/${repoPath}/issues/${issue}/comments`;
	return (await forgejoHttp.getJson(url, options, z.array(Comment))).body;
}
async function createCommitStatus(repoPath, branchCommit, params, options) {
	const url = `${API_PATH}/repos/${repoPath}/statuses/${branchCommit}`;
	return (await forgejoHttp.postJson(url, {
		...options,
		body: params
	}, CommitStatus)).body;
}
const forgejoToRenovateStatusMapping = {
	unknown: "yellow",
	success: "green",
	pending: "yellow",
	warning: "red",
	failure: "red",
	error: "red"
};
const renovateToForgejoStatusMapping = {
	green: "success",
	yellow: "pending",
	red: "failure"
};
function filterStatus(data) {
	const ret = {};
	for (const i of data) if (!ret[i.context] || ret[i.context].id < i.id) ret[i.context] = i;
	return Object.values(ret);
}
async function getCombinedCommitStatus(repoPath, branchName, options) {
	const url = `${API_PATH}/repos/${repoPath}/commits/${urlEscape(branchName)}/statuses`;
	const res = await forgejoHttp.getJson(url, {
		...options,
		paginate: true
	}, z.array(CommitStatus));
	let worstState = 0;
	const statuses = filterStatus(res.body);
	for (const cs of statuses) worstState = Math.max(worstState, commitStatusStates.indexOf(cs.status));
	return {
		worstStatus: commitStatusStates[worstState],
		statuses
	};
}
//#endregion
export { closeIssue, createComment, createCommitStatus, createIssue, createPR, deleteComment, forgejoHttp, forgejoToRenovateStatusMapping, getCombinedCommitStatus, getComments, getCurrentUser, getIssue, getOrgLabels, getPR, getPRByBranch, getRepo, getRepoContents, getRepoLabels, getVersion, isOrg, mergePR, orgListRepos, renovateToForgejoStatusMapping, requestPrReviewers, searchIssues, searchRepos, unassignLabel, updateComment, updateIssue, updateIssueLabels, updatePR };

//# sourceMappingURL=forgejo-helper.js.map