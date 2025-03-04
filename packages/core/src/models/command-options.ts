import { boolean } from 'yargs';
import { RemoteClientType } from './interfaces';

export interface ChangedCommandOption {
  /** use conventional-changelog to determine version bump and generate CHANGELOG. */
  conventionalCommits?: boolean;

  /** detect currently prereleased packages that would change to a non-prerelease version. */
  conventionalGraduate: boolean | string | string[];

  /** always include targeted packages when detecting changed packages, skipping default logic. */
  forcePublish?: boolean | string | string[];

  /** ignore changes in files matched by glob(s) when detecting changed packages. Pass `--no-ignore-changes` to completely disable. */
  ignoreChanges: string[];

  /** include tags from merged branches when detecting changed packages. */
  includeMergedTags?: boolean;
}

export interface DiffCommandOption {
  /** ignore changes in files matched by glob(s) when detecting changed packages. Pass `--no-ignore-changes` to completely disable. */
  ignoreChanges: string[];

  /** package name */
  pkgName: string;
}

export interface ExecCommandOption {
  /** command to execute by the command */
  cmd?: string;

  /** exec command arguments */
  args?: any;

  /** @deprecated option was renamed to `--dry-run`, @see dryRun */
  cmdDryRun?: boolean;

  /** Displays the execution command that would be performed without executing it. */
  dryRun?: boolean;

  /** Stream output with lines prefixed by originating package name. */
  stream?: boolean;

  /** Execute command with unlimited concurrency, streaming prefixed output. */
  parallel?: boolean;

  /** Continue executing command despite non-zero exit in a given package. */
  noBail?: boolean;

  /** proxy for `--no-bail` */
  bail?: boolean;

  // This option controls prefix for stream output so that it can be disabled to be friendly
  // to tools like Visual Studio Code to highlight the raw results
  /** Do not prefix streaming output. */
  noPrefix?: boolean;

  /** proxy for `--no-prefix` */
  prefix?: boolean;

  /** Profile command executions and output performance profile to default location. */
  profile?: boolean;

  /** Output performance profile to custom location instead of default project root. */
  profileLocation?: string;
}

export interface InitCommandOption {
  /** specify lerna dependency version in package.json without a caret (^) */
  exact?: boolean;

  /** version packages independently */
  independent?: boolean;

  /** enables integration with Yarn or other package manager that use `workspaces` property in `package.json` */
  useWorkspaces?: boolean;
}

export interface ListCommandOption {
  /** Show private packages that are hidden by default. */
  all?: boolean;

  /** Show dependency graph as a JSON-formatted [adjacency list](https://en.wikipedia.org/wiki/Adjacency_list). */
  graph?: boolean;

  /** Show information as a JSON array. */
  json?: boolean;

  /** Show extended information. */
  long?: boolean;

  /** Show information as [newline-delimited JSON](http://ndjson.org/). */
  ndjson?: boolean;

  /** Show parseable output instead of columnified view. */
  parseable?: boolean;

  /** Sort packages in topological order (dependencies before dependents) instead of lexical by directory. */
  toposort?: boolean;
}

export interface PublishCommandOption extends VersionCommandOption {
  /** alias to `--canary` */
  c?: boolean;

  /** Publish packages after every successful merge using the sha as part of the tag. */
  canary?: boolean;

  /** Specify the prerelease identifier when publishing a prerelease */
  preid?: string;

  /** Subdirectory to publish. Must apply to ALL packages. */
  contents?: string;

  /** Publish packages with the specified npm dist-tag */
  distTag?: string;

  /** Legacy Base64 Encoded username and password. */
  legacyAuth?: string;

  /** Publish prerelease packages with the specified npm dist-tag */
  preDistTag?: string;

  /** Explicit SHA to set as gitHead when packing tarballs, only allowed with "from-package" positional. */
  gitHead?: string;

  /** Type of dependency to use when determining package hierarchy. */
  graphType: 'all' | 'dependencies';

  /** Disable deprecated "prepublish" lifecycle script */
  ignorePrepublish?: boolean;

  /** Disable all lifecycle scripts */
  ignoreScripts?: boolean;

  // TODO: (major) make `--no-granular-pathspec` the default
  /** Do not reset changes file-by-file, but globally. */
  noGranularPathspec?: boolean;

  /** proxy for `--no-granular-pathspec` */
  granularPathspec?: boolean;

  /** Supply a one-time password for publishing with two-factor authentication. */
  otp?: string;

  /** apply publishConfig overrides. */
  publishConfigOverrides?: boolean;

  /** Use the specified registry for all npm client operations. */
  registry?: string;

  /** Remove fields from each package.json before publishing them to the registry, removing fields from a complex object is also supported via the dot notation (ie "scripts.build") */
  removePackageFields?: string[];

  /** Execute ./scripts/prepublish.js and ./scripts/postpublish.js, relative to package root. */
  requireScripts?: boolean;

  /** Do not reset changes to working tree after publishing is complete. */
  noGitReset?: boolean;

  // proxy for `--no-git-reset`
  gitReset?: boolean;

  /** Create a temporary tag while publishing. */
  tempTag?: boolean;

  /** Do not verify package read-write access for current npm user. */
  noVerifyAccess?: boolean;

  /** proxy for `--no-verify-access` */
  verifyAccess?: boolean;

  /** alias to `--yes` */
  y?: boolean;

  /** Skip all confirmation prompts. */
  yes?: boolean;
}

export interface VersionCommandOption {
  /** Specify which branches to allow versioning from. */
  allowBranch?: string[];

  /**
   * allow updating peer dependencies versions.
   * Note that `peerDependencies` with semver range (ie `>=2.0.0`) will never be bumped even with this flag enabled.
   */
  allowPeerDependenciesUpdate?: boolean;

  /** Amend the existing commit, instead of generating a new one. */
  amend?: boolean;

  /** conventional commit version bump type */
  // prettier-ignore
  bump: 'major' | 'minor' | 'patch' | 'premajor' | 'preminor' | 'prepatch' | 'prerelease' | 'from-git' | 'from-package';

  /** Use conventional-changelog to determine version bump and generate CHANGELOG. */
  conventionalCommits?: boolean;

  /** Version currently prereleased packages to a non-prerelease version. */
  conventionalGraduate?: boolean | string;

  /** Version changed packages as prereleases when using `--conventional-commits`. */
  conventionalPrerelease?: boolean | string;

  /** Bumps prerelease versions if conventional commits requires it. This option is only available when using `--conventional-commits`. */
  conventionalBumpPrerelease?: boolean;

  /** Add a custom message at the top of all "changelog.md" files. This option is only available when using `--conventional-commits` with changelogs. */
  changelogHeaderMessage?: string;

  /**
   * Specify if we want to include the commit author's name, this option is only available when using `--conventional-commits` with changelogs.
   * We can also optionally provide a custom message or else a default format will be used.
   */
  changelogIncludeCommitsGitAuthor?: boolean | string;

  /** @deprecated option renamed to `changelogIncludeCommitsGitAuthor` */
  changelogIncludeCommitAuthorFullname?: boolean | string;

  /**
   * Specify if we want to include the commit remote client login name (ie GitHub username), this option is only available when using `--conventional-commits` with changelogs.
   * We can also optionally provide a custom message or else a default format will be used.
   */
  changelogIncludeCommitsClientLogin?: boolean | string;

  /**
   * Add a custom message as a prefix to each new version in your "changelog.md" which is located in the root of your project.
   * This option is only available when using `--conventional-commits` with changelogs.
   */
  changelogVersionMessage?: string;

  /** Defaults 'angular', custom conventional-changelog preset. */
  changelogPreset?: string;

  /** Create an official GitHub or GitLab release for every version. */
  createRelease?: RemoteClientType;

  /** Specify cross-dependency version numbers exactly rather than with a caret (^). */
  exact?: boolean;

  /** Always include targeted packages in versioning operations, skipping default logic. */
  forcePublish?: boolean | string;

  /** Displays the process command that would be performed without executing it. */
  dryRun?: boolean;

  /** @deprecated option was renamed to `--dry-run`, @see dryRun */
  gitDryRun?: boolean;

  /** Defaults to 'origin', push git changes to the specified remote. */
  gitRemote: string;

  /**
   * Ignore changes in files matched by glob(s) when detecting changed packages.
   * Pass `--no-ignore-changes` to completely disable.
   */
  ignoreChanges?: string[];

  /** Disable all lifecycle scripts. */
  ignoreScripts?: boolean;

  /** Include tags from merged branches when detecting changed packages. */
  includeMergedTags?: boolean;

  /** alias to `--message`. */
  m?: string;

  /** Use a custom commit message when creating the version commit. */
  message?: string;

  /** Do not generate CHANGELOG.md files when using `--conventional-commits`. */
  noChangelog?: boolean;

  /** proxy for `--no-changelog`. */
  changelog?: boolean;

  /** Do not run git commit hooks when committing version changes. */
  noCommitHooks?: boolean;

  /** proxy for `--no-commit-hooks`. */
  commitHooks?: boolean;

  /** Do not commit or tag version changes. */
  noGitTagVersion?: boolean;

  /** proxy for `--no-git-tag-version`. */
  gitTagVersion?: boolean;

  // TODO: (major) make `--no-granular-pathspec` the default
  /** Do not stage changes file-by-file, but globally. */
  noGranularPathspec?: boolean;

  /** Stage changes file-by-file, not globally. Proxy for `--no-granular-pathspec`. */
  granularPathspec?: boolean;

  // TODO: (major) make `--no-private` the default
  /** Do not version private packages. */
  noPrivate?: boolean;

  /** proxy for `--no-private`. */
  private?: boolean;

  /** Do not push tagged commit to git remote. */
  noPush?: boolean;

  /** proxy for `--no-push`. */
  push?: boolean;

  // preid is copied into ../publish/command because a whitelist for one option isn't worth it
  /** Defaults to 'alpha', specify the prerelease identifier when versioning a prerelease. */
  preid?: string;

  /** Remote git client, which client is used when reading commits from remote which is useful when associating client login for each changelog entry. */
  remoteClient?: RemoteClientType;

  /** Pass the `--gpg-sign` flag to `git commit`. */
  signGitCommit?: boolean;

  /** Pass the `--signoff` flag to `git commit`. */
  signoffGitCommit?: boolean;

  /** Pass the `--sign` flag to `git tag`. */
  signGitTag?: boolean;

  /** Pass the `--force` flag to `git tag`. */
  forceGitTag?: boolean;

  /** Defaults to 'v', customize the tag prefix. To remove entirely, pass an empty string. */
  tagVersionPrefix?: string;

  /** Do not manually update (read/write back to the lock file) the project root lock file. */
  noManuallyUpdateRootLockfile?: boolean;

  /** Defaults to true when found, update the project root lock file, the lib will internally read/write back to the lock file. */
  manuallyUpdateRootLockfile?: boolean;

  /** Additional arguments to pass to the npm client when performing 'npm install'. */
  npmClientArgs?: string[];

  /** Runs `npm install --package-lock-only` or equivalent depending on the package manager defined in `npmClient`. */
  syncWorkspaceLock?: boolean;

  /**
   * @deprecated Strict match transform version numbers to an exact range (like "1.2.3") rather than with a caret (like ^1.2.3) when using `workspace:*`.
   * Future version will make `workspace:` protocol as strict matching at all time, so this flag becomes redundant.
   */
  workspaceStrictMatch?: boolean;

  /** alias to `--yes` */
  y?: boolean;

  /** Skip all confirmation prompts. */
  yes?: boolean;
}

export interface RunCommandOption {
  /** @deprecated option was renamed to `--dry-run`, @see dryRun */
  cmdDryRun?: boolean;

  /** Displays the process command that would be performed without executing it. */
  dryRun?: boolean;

  /** Defaults to 'npm', executable used to run scripts (npm, yarn, pnpm, ...). */
  npmClient?: string;

  /** Stream output with lines prefixed by package. */
  stream?: boolean;

  /** Run script with unlimited concurrency, streaming prefixed output. */
  parallel?: boolean;

  /** Continue running script despite non-zero exit in a given package. */
  noBail?: boolean;

  /** proxy for `--no-bail`. */
  bail?: boolean;

  /** When useNx is enabled, do we want to automatically load .env files */
  loadEnvFiles?: boolean;

  /** Do not prefix streaming output. */
  noPrefix?: boolean;

  /** proxy for `--no-prefix`. */
  prefix?: boolean;

  /** Profile script executions and output performance profile to default location. */
  profile?: boolean;

  /** Output performance profile to custom location instead of default project root. */
  profileLocation?: string;

  /** npm script to run by the command. */
  script: string;

  /** when "useNx" is enabled, do we want to skip caching with Nx? */
  skipNxCache?: boolean;

  /** enables integration with [Nx](https://nx.dev) instead of the default Lerna task runner (which uses `p-map` and `p-queue`). */
  useNx?: boolean;
}
