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
const update_branch_1 = require("./update-branch");
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
            const res = yield update_branch_1.updateBranch(Object.assign(Object.assign({ octokit }, context), { branch, force, fromProtectedOnly }));
            if (res) {
                core[res.type](res.msg);
            }
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
run();
