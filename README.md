# Update git branch action

A GitHub Action that update a specific branch to the current commit running the action.

## Usage

This GitHub Action update a branch. Here's an example workflow that update a staging branch at
each commit on master you push a commit on master:

```yaml
on: push
name: Update prod branch on release
jobs:
  updateBranch:
    name: Update staging branch
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@master
    - uses: Embraser01/update-git-branch-action@v1.0.0
      if: github.ref == 'refs/heads/master'
      with:
        branch: staging
        force: 1 # To push-force to the branch
        githubToken: ${{ secrets.PAT_TOKEN }} # Github Token
```

## Github token

If you want to trigger another workflow, you'll need to generate a Personal Access Token
[here](https://github.com/settings/tokens). Pushing a commit with the `GITHUB_TOKEN` env
variable will not trigger other workflows.

## Tags

When a tag is pushed, the action will check if the tag is the HEAD of a protected branch. It
uses the
[Github API](https://developer.github.com/v3/repos/commits/#list-branches-for-head-commit). It
could fail if a commit was pushed before the action is started.

## Options

- `branch`: The branch to update (**required**).
- `force`: Indicates whether to force the update or to make sure the update is a fast-forward
  update. Leaving this out or setting it to `false` will make sure you're not overwriting work.
- `githubToken`: Github token required to push the commit to the branch.
