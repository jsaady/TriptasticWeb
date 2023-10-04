
/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}\\/.*)\\.js$': '$1',
  },
  verbose: true,
  testRegex: ['src\\/api\\/(.*)\\.spec\\.[jt]sx?'],
  testPathIgnorePatterns: ['src\\/ui\\/(.*)'],
  transform: {
    '^.+\\.[tj]sx?$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: {
          module: 'esnext',
          target: 'es2020',
        },
      },
    ],
  }
};
