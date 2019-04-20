const { Toolkit } = require("actions-toolkit");

Toolkit.run(
  async tools => {
    tools.exit.success("We did it!");

    const { branch, force = false, sourceBranch, tagPrefix } = tools.arguments;

    if (!branch) {
      return tools.exit.failure(
        "A branch option is required (i.e: --branch staging)"
      );
    }

    if (!sourceBranch && tagPrefix) {
      return tools.exit.failure(
        "Options sourceBranch and tagPrefix can't be used together"
      );
    }

    const ref = tools.context.ref;
    if (ref === `heads/${branch}`) {
      return tools.exit.neutral(
        "Commit is already on the destination branch, ignoring"
      );
    }

    if (sourceBranch && ref !== `heads/${sourceBranch}`) {
      return tools.exit.neutral(
        `Commit is not on the configured source branch '${sourceBranch}', ignoring`
      );
    }

    if (
      tagPrefix &&
      ref.startsWith("tags/") &&
      !ref.startsWith(`tags/${tagPrefix}`)
    ) {
      return tools.exit.neutral("Tag doesn't match tagPrefix, ignoring");
    }

    await tools.github.git.updateRef({
      ...tools.context.repo,
      sha: tools.context.sha,
      ref: `heads/${branch}`,
      force
    });
  },
  { event: "push" }
);
