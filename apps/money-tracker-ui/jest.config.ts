/* eslint-disable */
export default {
  displayName: 'money-tracker-ui',
  preset: '../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
      stringifyContentPathRegex: '\\.(html|svg)$',
    },
  },
  coverageDirectory: '../../coverage/apps/money-tracker-ui/',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': 'jest-preset-angular',
    /*    '\\.[jt]sx?$': ['ts-jest', {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
    }]*/
  },
  transformIgnorePatterns: [
    'node_modules/(?!.*\\.mjs$|lodash-es|uri-templates-es)',
  ],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
