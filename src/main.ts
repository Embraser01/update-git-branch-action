import * as core from '@actions/core';
import * as github from '@actions/github';

// This should be a token with access to your repository scoped in as a secret.
const githubToken = core.getInput('githubToken');
const octokit = new github.GitHub(githubToken);
const context = github.context;

async function run() {
  try {
    const branch = core.getInput('branch');
    const force = !!core.getInput('force');
    const fromProtectedOnly = core.getInput('fromProtectedOnly');

    const { ref, repo, sha } = context;

    // Ignore pushes on the destination branch (otherwise, it would update the branch twice)
    if (ref === `refs/heads/${branch}`) {
      return core.warning(
        'Commit is already on the destination branch, ignoring',
      );
    }

    // If action runs on a tag (on: release), check if the commit is the head of at least one protected branch
    // It ensure that the release uses a safe commit
    if (ref.startsWith('refs/tags/') && fromProtectedOnly) {
      const {
        data: heads,
      } = await octokit.repos.listBranchesForHeadCommit({
        ...repo,
        commit_sha: sha,
      });

      if (!heads.length) {
        return core.warning('Tag isn\'t head of any branches');
      }

      if (!heads.find(value => value.protected)) {
        return core.warning(
          'A tag was pushed but isn\'t head of a protected branch, skipping',
        );
      }
    }

    await octokit.git.updateRef({
      ...repo,
      sha: sha,
      ref: `heads/${branch}`,
      force,
    });
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
