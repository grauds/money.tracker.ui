/* eslint-disable */
export default {
  displayName: 'model',
  preset: '../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
      stringifyContentPathRegex: '\\.(html|svg)$',
    },
  },
  coverageDirectory: '../../coverage/libs/model',
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
