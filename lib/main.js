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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
// This should be a token with access to your repository scoped in as a secret.
const githubToken = core.getInput('githubToken');
const octokit = new github.GitHub(githubToken);
const context = github.context;
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const branch = core.getInput('branch');
            const force = !!core.getInput('force');
            const fromProtectedOnly = core.getInput('fromProtectedOnly');
            const { ref, repo, sha } = context;
            // Ignore pushes on the destination branch (otherwise, it would update the branch twice)
            if (ref === `refs/heads/${branch}`) {
                return core.warning('Commit is already on the destination branch, ignoring');
            }
            // If action runs on a tag (on: release), check if the commit is the head of at least one protected branch
            // It ensure that the release uses a safe commit
            if (ref.startsWith('refs/tags/') && fromProtectedOnly) {
                const { data: heads, } = yield octokit.repos.listBranchesForHeadCommit(Object.assign(Object.assign({}, repo), { commit_sha: sha }));
                if (!heads.length) {
                    return core.warning('Tag isn\'t head of any branches');
                }
                if (!heads.find(value => value.protected)) {
                    return core.warning('A tag was pushed but isn\'t head of a protected branch, skipping');
                }
            }
            yield octokit.git.updateRef(Object.assign(Object.assign({}, repo), { sha: sha, ref: `heads/${branch}`, force }));
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
run();
