jest.mock('@octokit/rest');
jest.mock('../../child-process');

import { Octokit } from '@octokit/rest';
import { execSync } from '../../child-process';
import { createGitHubClient, parseGitRepo } from '../index';

(execSync as jest.Mock).mockReturnValue('5.6.0');

describe('createGitHubClient', () => {
  beforeEach(() => {
    process.env = {};
  });

  it('doesnt error if GH_TOKEN env var is set', () => {
    process.env.GH_TOKEN = 'TOKEN';

    expect(() => {
      createGitHubClient();
    }).not.toThrow();
  });

  it('initializes GHE plugin when GHE_VERSION env var is set', () => {
    process.env.GH_TOKEN = 'TOKEN';
    process.env.GHE_VERSION = '2.18';

    createGitHubClient();

    expect(Octokit.plugin).toHaveBeenCalledWith(expect.anything());
  });

  it('sets octokit `baseUrl` when GHE_API_URL is set', () => {
    process.env.GH_TOKEN = 'TOKEN';
    process.env.GHE_API_URL = 'http://some/host';

    createGitHubClient();

    expect(Octokit).toHaveBeenCalledWith({
      auth: 'token TOKEN',
      baseUrl: 'http://some/host',
    });
  });
});

describe('parseGitRepo', () => {
  it('returns a parsed URL', () => {
    (execSync as jest.Mock).mockReturnValue('git@github.com:org/lerna.git');

    const repo = parseGitRepo();

    expect(execSync).toHaveBeenCalledWith('git', ['config', '--get', 'remote.origin.url'], undefined);

    expect(repo).toEqual(
      expect.objectContaining({
        name: 'lerna',
        owner: 'org',
      })
    );
  });

  it('can change the origin', () => {
    (execSync as jest.Mock).mockReturnValue('git@github.com:org/lerna.git');

    parseGitRepo('upstream');

    expect(execSync).toHaveBeenCalledWith('git', ['config', '--get', 'remote.upstream.url'], undefined);
  });

  it('throws an error if no URL returned', () => {
    (execSync as jest.Mock).mockReturnValue('');

    expect(() => parseGitRepo()).toThrow('Git remote URL could not be found using "origin".');
  });
});
