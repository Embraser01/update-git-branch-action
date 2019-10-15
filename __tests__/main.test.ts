import { updateBranch } from '../src/update-branch';

const defaultOptions = {
  octokit: null,
  branch: '',
  ref: '',
  repo: '',
  sha: '',
  force: false,
};

it('should skip if same branch', async () => {
  const res = await updateBranch({
    ...defaultOptions,
    branch: 'prod',
    ref: 'refs/heads/prod',
  });

  expect(res).toMatchObject({
    type: 'warning',
    msg: 'Commit is already on the destination branch, ignoring',
  });
});

describe('tag handling', () => {
  it('should load head commits', async () => {
    const listBranchesForHeadCommit = jest.fn(() => ({ data: [] }));

    const res = await updateBranch({
      ...defaultOptions,
      branch: 'prod',
      ref: 'refs/tags/v1.0.0',
      sha: '0a8e3efc3b91cc0f006aadaced32a8d6f7d9261f',
      octokit: {
        repos: { listBranchesForHeadCommit },
        git: { updateRef: jest.fn() },
      },
    });

    expect(listBranchesForHeadCommit).toHaveBeenCalledWith(expect.objectContaining({
      commit_sha: '0a8e3efc3b91cc0f006aadaced32a8d6f7d9261f',
    }));
  });

  it('should skip if commit not head of any branch', async () => {
    const res = await updateBranch({
      ...defaultOptions,
      branch: 'prod',
      ref: 'refs/tags/v1.0.0',
      sha: '0a8e3efc3b91cc0f006aadaced32a8d6f7d9261f',
      octokit: {
        repos: { listBranchesForHeadCommit: jest.fn(() => ({ data: [] })) },
        git: { updateRef: jest.fn() },
      },
    });

    expect(res).toMatchObject({
      type: 'warning',
      msg: 'Tag isn\'t head of any branches',
    });
  });

  it('should skip if commit is not on protected branch', async () => {
    const res = await updateBranch({
      ...defaultOptions,
      branch: 'prod',
      ref: 'refs/tags/v1.0.0',
      sha: '0a8e3efc3b91cc0f006aadaced32a8d6f7d9261f',
      octokit: {
        repos: { listBranchesForHeadCommit: jest.fn(() => ({ data: [{ protected: false }] })) },
        git: { updateRef: jest.fn() },
      },
    });

    expect(res).toMatchObject({
      type: 'warning',
      msg: 'A tag was pushed but isn\'t head of a protected branch, skipping',
    });
  });

  it('should work if tag is head on protected branch', async () => {
    const res = await updateBranch({
      ...defaultOptions,
      branch: 'prod',
      ref: 'refs/tags/v1.0.0',
      sha: '0a8e3efc3b91cc0f006aadaced32a8d6f7d9261f',
      octokit: {
        repos: { listBranchesForHeadCommit: jest.fn(() => ({ data: [{ protected: true }] })) },
        git: { updateRef: jest.fn() },
      },
    });

    expect(res).toBeUndefined();
  });
});

it('should work if commit is head on protected branch', async () => {
  const updateRef = jest.fn();
  const res = await updateBranch({
    ...defaultOptions,
    branch: 'prod',
    ref: 'refs/heads/master',
    sha: '0a8e3efc3b91cc0f006aadaced32a8d6f7d9261f',
    octokit: { git: { updateRef } },
  });

  expect(res).toBeUndefined();
  expect(updateRef).toHaveBeenCalledWith(expect.objectContaining({
    sha: '0a8e3efc3b91cc0f006aadaced32a8d6f7d9261f',
    ref: 'heads/prod',
  }));
});


it('should pass the force option', async () => {
  const updateRef = jest.fn();
  const res = await updateBranch({
    ...defaultOptions,
    octokit: { git: { updateRef } },
    force: true,
  });

  expect(res).toBeUndefined();
  expect(updateRef).toHaveBeenCalledWith(expect.objectContaining({
    force: true,
  }));
});
