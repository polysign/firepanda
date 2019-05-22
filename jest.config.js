module.exports = {
  "maxConcurrency": 1,
  "verbose": true,
  "roots": [
    "<rootDir>/src"
  ],
  "collectCoverageFrom": [
    "**/*.ts",
    "!**/index.ts",
    "!**/types.ts",
    "!**/*.test.ts",
    "!**/tests/**/*.ts",
    "!**/node_modules/**",
    "!**/vendor/**"
  ],
  "transform": {
    "^.+\\.tsx?$": "ts-jest"
  },
  "testRegex": "(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$",
  "moduleFileExtensions": [
    "ts",
    "tsx",
    "js",
    "jsx",
    "json",
    "node"
  ],
}