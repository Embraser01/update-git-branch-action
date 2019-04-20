# Update git branch action

A GitHub Action that update a branch with current commit.

## Usage

This GitHub Action update a branch. Here's an example workflow that update a staging branch at
each commit on master you push a commit on master:

```workflow
workflow "Update staging branch on push" {
  on = "push"
  resolves = ["Update branch"]
}

action "Master" {
  uses = "actions/bin/filter@master"
  args = "branch master"
}

action "Update branch" {
  needs = "Master"
  uses = "Embraser01/update-git-branch-action@master"
  args = "--branch staging --force"
  secrets = ["GITHUB_TOKEN"]
}
```

You could also run this after a release is published (see [tags](#tags)):

```workflow
workflow "Update stable branch on release" {
  on = "release"
  resolves = ["Update branch"]
}

action "Tag" {
  uses = "actions/bin/filter@master"
  args = "tag v*"
}

action "Update branch" {
  needs = "Tag"
  uses = "Embraser01/update-git-branch-action@master"
  args = "--branch stable"
  secrets = ["GITHUB_TOKEN"]
}
```

## Tags

When a tag is pushed, the action will check if the tag is the HEAD of a protected branch. It
uses the
[Github API](https://developer.github.com/v3/repos/commits/#list-branches-for-head-commit). It
could fail if a commit was pushed before the action is started.

## Options

- `branch`: The branch to update (**required**).
- `skipProtected`: For tags, don't check for protected branch.
- `force`: Indicates whether to force the update or to make sure the update is a fast-forward
  update. Leaving this out or setting it to `false` will make sure you're not overwriting work.

> To filter the source branch or tags, use
> [filter action](https://github.com/actions/bin/tree/master/filter).
