import { ExtraEnv } from "../exec/types.js";
import { GitProtocol } from "../../types/git.js";
import { LongCommitSha } from "../schema-utils/git.js";
import { CommitFilesConfig, CommitResult, DiffTreeItem, PushFilesConfig, StatusResult, StorageConfig } from "./types.js";
import { RenovateConfig } from "../../config/types.js";
import { setNoVerify } from "./config.js";
import { setPrivateKey } from "./private-key.js";
import { DateTime } from "luxon";
import { SimpleGit, SimpleGitOptions } from "simple-git";

//#region lib/util/git/index.d.ts
declare const RENOVATE_FORK_UPSTREAM = "renovate-fork-upstream";
declare function createSimpleGit({
  config,
  env
}?: {
  config?: Partial<SimpleGitOptions>;
  env?: ExtraEnv;
}): SimpleGit;
declare function gitRetry<T>(gitFunc: () => Promise<T>): Promise<T>;
declare const GIT_MINIMUM_VERSION = "2.33.0";
declare function validateGitVersion(): Promise<boolean>;
declare function fetchRevSpec(revSpec: string): Promise<void>;
declare function initRepo(args: StorageConfig): Promise<void>;
declare function resetToCommit(commit: LongCommitSha): Promise<void>;
declare function setGitAuthor(gitAuthor: string | undefined): void;
declare function writeGitAuthor(): Promise<void>;
declare function setUserRepoConfig({
  gitIgnoredAuthors,
  gitAuthor
}: RenovateConfig): void;
declare function getSubmodules(): Promise<string[]>;
declare function cloneSubmodules(shouldClone: boolean, cloneSubmodulesFilter: string[] | undefined): Promise<void>;
declare function isCloned(): boolean;
declare const syncGit: () => Promise<void>;
declare function getRepoStatus(path?: string): Promise<StatusResult>;
declare function branchExists(branchName: string): boolean;
declare function getBranchCommit(branchName: string): LongCommitSha | null;
declare function getBranchUpdateDate(branchName: string): Promise<DateTime | null>;
declare function getCommitMessages(): Promise<string[]>;
declare function checkoutBranch(branchName: string): Promise<LongCommitSha>;
declare function checkoutBranchFromRemote(branchName: string, remoteName: string): Promise<LongCommitSha>;
declare function resetHardFromRemote(remoteAndBranch: string): Promise<void>;
declare function forcePushToRemote(branchName: string, remote: string): Promise<void>;
declare function getFileList(): Promise<string[]>;
declare function getBranchList(): string[];
declare function isBranchBehindBase(branchName: string, baseBranch: string): Promise<boolean>;
declare function isBranchModified(branchName: string, baseBranch: string): Promise<boolean>;
declare function isBranchConflicted(baseBranch: string, branch: string): Promise<boolean>;
declare function deleteBranch(branchName: string, options?: {
  localBranch?: boolean;
}): Promise<void>;
declare function mergeToLocal(refSpecToMerge: string, options?: {
  localBranch?: boolean;
}): Promise<void>;
declare function mergeBranch(branchName: string): Promise<void>;
declare function getBranchLastCommitTime(branchName: string): Promise<Date>;
declare function getBranchFiles(branchName: string): Promise<string[] | null>;
declare function getBranchFilesFromCommit(referenceCommit: LongCommitSha): Promise<string[] | null>;
declare function getFile(filePath: string, branchName?: string): Promise<string | null>;
declare function getFiles(fileNames: string[]): Promise<Record<string, string | null>>;
declare function hasDiff(sourceRef: string, targetRef: string): Promise<boolean>;
/**
 *
 * Prepare local branch with commit
 *
 * 0. Hard reset
 * 1. Creates local branch with `origin/` prefix
 * 2. Perform `git add` (respecting mode) and `git remove` for each file
 * 3. Perform commit
 * 4. Check whether resulting commit is empty or not (due to .gitignore)
 * 5. If not empty, return commit info for further processing
 *
 */
declare function prepareCommit({
  branchName,
  files,
  message,
  force
}: CommitFilesConfig): Promise<CommitResult | null>;
declare function pushCommit({
  sourceRef,
  targetRef,
  files,
  pushOptions
}: PushFilesConfig): Promise<boolean>;
declare function fetchBranch(branchName: string): Promise<LongCommitSha | null>;
declare function commitFiles(commitConfig: CommitFilesConfig): Promise<LongCommitSha | null>;
declare function getUrl({
  protocol,
  auth,
  hostname,
  host,
  repository
}: {
  protocol?: GitProtocol;
  auth?: string;
  hostname?: string;
  host?: string;
  repository: string;
}): string;
/**
 *
 * Non-branch refs allow us to store git objects without triggering CI pipelines.
 * It's useful for API-based branch rebasing.
 *
 * @see https://stackoverflow.com/questions/63866947/pushing-git-non-branch-references-to-a-remote/63868286
 *
 */
declare function pushCommitToRenovateRef(commitSha: string, refName: string): Promise<void>;
/**
 *
 * Removes all remote "refs/renovate/branches/*" refs in two steps:
 *
 * Step 1: list refs
 *
 *   $ git ls-remote origin "refs/renovate/branches/*"
 *
 *   > cca38e9ea6d10946bdb2d0ca5a52c205783897aa        refs/renovate/branches/foo
 *   > 29ac154936c880068994e17eb7f12da7fdca70e5        refs/renovate/branches/bar
 *   > 3fafaddc339894b6d4f97595940fd91af71d0355        refs/renovate/branches/baz
 *   > ...
 *
 * Step 2:
 *
 *   $ git push --delete origin refs/renovate/branches/foo refs/renovate/branches/bar refs/renovate/branches/baz
 *
 * If Step 2 fails because the repo doesn't allow bulk changes, we'll remove them one by one instead:
 *
 *   $ git push --delete origin refs/renovate/branches/foo
 *   $ git push --delete origin refs/renovate/branches/bar
 *   $ git push --delete origin refs/renovate/branches/baz
 */
declare function clearRenovateRefs(): Promise<void>;
/**
 * Get the tree SHA for a commit.
 */
declare function getCommitTreeSha(commitSha: LongCommitSha): Promise<LongCommitSha>;
/**
 * Return only the files that changed between two commits.
 * Deletions have `sha: null` (for use with GitHub's `base_tree` API).
 */
declare function diffCommitTree(parentCommitSha: LongCommitSha, commitSha: LongCommitSha): Promise<DiffTreeItem[]>;
/**
 * Synchronize a forked branch with its upstream counterpart.
 *
 * syncForkWithUpstream updates the fork's branch, to match the corresponding branch in the upstream repository.
 * The steps are:
 * 1. Check if the branch exists locally.
 * 2. If the branch exists locally: checkout the local branch.
 * 3. If the branch does _not_ exist locally: checkout the upstream branch.
 * 4. Reset the local branch to match the upstream branch.
 * 5. Force push the (updated) local branch to the origin repository.
 *
 * @param {string} branchName - The name of the branch to synchronize.
 * @returns A promise that resolves to True if the synchronization is successful, or `false` if an error occurs.
 */
declare function syncForkWithUpstream(branchName: string): Promise<void>;
declare function getRemotes(): Promise<string[]>;
//#endregion
export { GIT_MINIMUM_VERSION, RENOVATE_FORK_UPSTREAM, branchExists, checkoutBranch, checkoutBranchFromRemote, clearRenovateRefs, cloneSubmodules, commitFiles, createSimpleGit, deleteBranch, diffCommitTree, fetchBranch, fetchRevSpec, forcePushToRemote, getBranchCommit, getBranchFiles, getBranchFilesFromCommit, getBranchLastCommitTime, getBranchList, getBranchUpdateDate, getCommitMessages, getCommitTreeSha, getFile, getFileList, getFiles, getRemotes, getRepoStatus, getSubmodules, getUrl, gitRetry, hasDiff, initRepo, isBranchBehindBase, isBranchConflicted, isBranchModified, isCloned, mergeBranch, mergeToLocal, prepareCommit, pushCommit, pushCommitToRenovateRef, resetHardFromRemote, resetToCommit, setGitAuthor, setNoVerify, setPrivateKey, setUserRepoConfig, syncForkWithUpstream, syncGit, validateGitVersion, writeGitAuthor };
//# sourceMappingURL=index.d.ts.map