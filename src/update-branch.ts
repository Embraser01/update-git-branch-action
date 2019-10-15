export async function updateBranch({
  octokit,
  branch,
  ref,
  repo,
  sha,
  force = false,
}) {
  // Ignore pushes on the destination branch (otherwise, it would update the branch twice)
  if (ref === `refs/heads/${branch}`) {
    return {
      type: 'warning',
      msg: 'Commit is already on the destination branch, ignoring',
    };
  }

  // If action runs on a tag (on: release), check if the commit is the head of at least one protected branch
  // It ensure that the release uses a safe commit
  if (ref.startsWith('refs/tags/')) {
    const { data: heads } = await octokit.repos.listBranchesForHeadCommit({
      ...repo,
      commit_sha: sha,
    });

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

  await octokit.git.updateRef({
    ...repo,
    sha: sha,
    ref: `heads/${branch}`,
    force,
  });

  return null;
}
