import { sanitize } from "../../../util/sanitize.js";
import { logger } from "../../../logger/index.js";
import { workItemTrackingApi } from "./azure-got-wrapper.js";
import { getWorkItemTitle } from "./util.js";
//#region lib/modules/platform/azure/issue.ts
var IssueService = class {
	config;
	constructor(config) {
		this.config = config;
	}
	async findIssue(title) {
		logger.debug(`findIssue(${title})`);
		try {
			const finalTitle = getWorkItemTitle(title, this.config.repository);
			return (await this.getIssueList(finalTitle))[0] ?? null;
		} catch (err) {
			logger.error({ err }, "Error finding issue");
			return null;
		}
	}
	async getIssueList(titleFilter) {
		logger.debug("getIssueList()");
		try {
			const azureApiWit = await workItemTrackingApi();
			let wiql = `
        SELECT [System.Id]
        FROM WorkItems
        WHERE [System.WorkItemType] = 'Issue'
          AND [System.TeamProject] = '${this.config.project}'
      `;
			if (titleFilter) {
				const escapedTitle = titleFilter.replace(/'/g, "''");
				wiql += ` AND [System.Title] = '${escapedTitle}'`;
			}
			const result = await azureApiWit.queryByWiql({ query: wiql });
			if (!result.workItems?.length) {
				logger.debug("getIssueList() no work items found");
				return [];
			}
			const workItemIds = result.workItems.map((wi) => wi.id);
			return (await azureApiWit.getWorkItems(workItemIds, [
				"System.Id",
				"System.Title",
				"System.State",
				"System.Description",
				"System.CreatedDate",
				"System.ChangedDate"
			])).map((wi) => ({
				number: wi.id,
				title: wi.fields["System.Title"],
				state: wi.fields["System.State"] === "Closed" ? "closed" : "open",
				body: wi.fields["System.Description"],
				createdAt: wi.fields["System.CreatedDate"],
				lastModified: wi.fields["System.ChangedDate"]
			}));
		} catch (err) {
			logger.warn({ err }, "Error fetching issue list");
			return [];
		}
	}
	async ensureIssueClosing(title) {
		logger.debug(`ensureIssueClosing(${title})`);
		try {
			const issue = await this.findIssue(title);
			if (issue?.state === "open" && issue.number) {
				await (await workItemTrackingApi()).updateWorkItem(void 0, [{
					op: "replace",
					path: "/fields/System.State",
					value: "Closed"
				}], issue.number, this.config.project);
				logger.debug(`Closed issue #${issue.number}: ${title}`);
			}
		} catch (err) {
			logger.error({ err }, "Error closing issue");
		}
	}
	async ensureIssue({ title, body, once = false, shouldReOpen = true }) {
		logger.debug(`ensureIssue()`);
		try {
			const azureApiWit = await workItemTrackingApi();
			const finalTitle = getWorkItemTitle(title, this.config.repository);
			const issues = await this.getIssueList(finalTitle);
			const openIssues = issues.filter((issue) => issue.state === "open");
			if (openIssues.length > 1) for (let i = 1; i < openIssues.length; i++) {
				const issueNumber = openIssues[i].number;
				if (issueNumber) {
					await azureApiWit.updateWorkItem(void 0, [{
						op: "replace",
						path: "/fields/System.State",
						value: "Closed"
					}], issueNumber, this.config.project);
					logger.info(`Closed duplicate issue #${issueNumber}`);
				}
			}
			const existingIssue = openIssues[0] ?? issues.find((issue) => issue.state === "closed");
			if (existingIssue) {
				if (existingIssue.state === "closed" && once) {
					logger.debug("Issue already closed - skipping update");
					return null;
				} else if (existingIssue.state === "closed" && shouldReOpen) {
					if (!existingIssue.number) {
						logger.warn("Cannot reopen issue without number");
						return null;
					}
					await azureApiWit.updateWorkItem(void 0, [
						{
							op: "replace",
							path: "/fields/System.State",
							value: "New"
						},
						{
							op: "replace",
							path: "/fields/System.Title",
							value: finalTitle
						},
						{
							op: "replace",
							path: "/fields/System.Description",
							value: sanitize(body)
						},
						{
							op: "replace",
							path: "/multilineFieldsFormat/System.Description",
							value: "Markdown"
						}
					], existingIssue.number, this.config.project);
					logger.debug(`Reopened issue #${existingIssue.number}`);
					return "updated";
				} else if (existingIssue.state === "open") {
					if (existingIssue.title !== finalTitle || existingIssue.body !== body) {
						if (!existingIssue.number) {
							logger.warn("Cannot update issue without number");
							return null;
						}
						await azureApiWit.updateWorkItem(void 0, [
							{
								op: "replace",
								path: "/fields/System.Title",
								value: finalTitle
							},
							{
								op: "replace",
								path: "/fields/System.Description",
								value: sanitize(body)
							},
							{
								op: "replace",
								path: "/multilineFieldsFormat/System.Description",
								value: "Markdown"
							}
						], existingIssue.number, this.config.project);
						logger.debug(`Updated issue #${existingIssue.number}`);
						return "updated";
					}
					logger.debug(`Issue #${existingIssue.number} is already up-to-date`);
					return "updated";
				}
			}
			const newWorkItem = await azureApiWit.createWorkItem(void 0, [
				{
					op: "add",
					path: "/fields/System.WorkItemType",
					value: "Issue"
				},
				{
					op: "add",
					path: "/fields/System.Title",
					value: finalTitle
				},
				{
					op: "add",
					path: "/fields/System.Description",
					value: sanitize(body)
				},
				{
					op: "add",
					path: "/multilineFieldsFormat/System.Description",
					value: "Markdown"
				},
				{
					op: "add",
					path: "/fields/System.State",
					value: "New"
				}
			], this.config.project, "Issue");
			logger.debug(`Created new issue #${newWorkItem.id}`);
			return "created";
		} catch (err) {
			logger.warn({ err }, "Error ensuring issue");
			return null;
		}
	}
};
//#endregion
export { IssueService };

//# sourceMappingURL=issue.js.map