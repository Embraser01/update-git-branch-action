"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
function updateBranch({ octokit, branch, ref, repo, sha, fromProtectedOnly, force = false, }) {
    return __awaiter(this, void 0, void 0, function* () {
        // Ignore pushes on the destination branch (otherwise, it would update the branch twice)
        if (ref === `refs/heads/${branch}`) {
            return {
                type: 'warning',
                msg: 'Commit is already on the destination branch, ignoring',
            };
        }
        // If action runs on a tag (on: release), check if the commit is the head of at least one protected branch
        // It ensure that the release uses a safe commit
        if (ref.startsWith('refs/tags/') && fromProtectedOnly) {
            const { data: heads, } = yield octokit.repos.listBranchesForHeadCommit(Object.assign(Object.assign({}, repo), { commit_sha: sha }));
            if (!heads.length) {
                return {
                    type: 'warning',
                    msg: 'Tag isn\'t head of any branches',
                };
            }
            if (!heads.find(value => value.protected)) {
                return {
                    type: 'warning',
                    msg: 'A tag was pushed but isn\'t head of a protected branch, skipping',
                };
            }
        }
        yield octokit.git.updateRef(Object.assign(Object.assign({}, repo), { sha: sha, ref: `heads/${branch}`, force }));
    });
}
exports.updateBranch = updateBranch;
