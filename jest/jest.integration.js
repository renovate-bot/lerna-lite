'use strict';

module.exports = {
  modulePathIgnorePatterns: ['/__fixtures__/'],
  roots: ['<rootDir>/integration'],
  setupFiles: ['@lerna-test/set-npm-userconfig'],
  setupFilesAfterEnv: ['<rootDir>/setup-integration-timeout.js'],
  snapshotSerializers: ['@lerna-test/helpers/serializers/serialize-placeholders.ts'],
  testEnvironment: 'node',
  testRunner: 'jest-circus/runner',
  verbose: true,
};

// split tests into smaller chunks because windows is agonizingly slow
if (process.env.LERNA_CI_TYPE) {
  module.exports.testMatch =
    process.env.LERNA_CI_TYPE === 'publish'
      ? ['<rootDir>/integration/@(lerna-publish)*.spec.ts']
      : ['<rootDir>/integration/!(lerna-publish|lerna-import)*.spec.ts'];
}
