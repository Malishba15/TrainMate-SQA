module.exports = {
  testEnvironment: "node",
  transform: {},
  testPathIgnorePatterns: [
    "/node_modules/",
    "/tests/e2e/",
  ],
  testMatch: ["**/__tests__/**/*.test.js"],
};