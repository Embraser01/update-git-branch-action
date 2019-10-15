import * as core from '@actions/core';
import * as github from '@actions/github';
import { updateBranch } from './update-branch';

// This should be a token with access to your repository scoped in as a secret.
const githubToken = core.getInput('githubToken');
const octokit = new github.GitHub(githubToken);
const context = github.context;

async function run() {
  try {
    const branch = core.getInput('branch');
    const force = !!core.getInput('force');

    const res = await updateBranch({ octokit, ...context, branch, force });

    if (res) {
      core[res.type](res.msg);
    }

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
