const { Toolkit } = require("actions-toolkit");

Toolkit.run(
  async tools => {
    tools.exit.success("We did it!");

    const { branch, force = false, skipProtected = false } = tools.arguments;

    if (!branch) {
      return tools.exit.failure(
        "A branch option is required (i.e: --branch staging)"
      );
    }

    const ref = tools.context.ref;
    if (ref === `heads/${branch}`) {
      return tools.exit.neutral(
        "Commit is already on the destination branch, ignoring"
      );
    }

    if (ref.startsWith("tags/")) {
      const {
        data: heads
      } = await tools.github.repos.listBranchesForHeadCommit({
        ...tools.context.repo,
        commit_sha: tools.context.sha
      });

      if (!heads.length) {
        return tools.exit.neutral("Tag isn't head of any branches");
      }

      if (!skipProtected && !heads.find(value => value.protected)) {
        return tools.exit.neutral(
          "A tag was pushed but isn't head of a protected branch, skipping"
        );
      }
    }

    await tools.github.git.updateRef({
      ...tools.context.repo,
      sha: tools.context.sha,
      ref: `heads/${branch}`,
      force
    });
  },
  { event: ["push", "release"] }
);
