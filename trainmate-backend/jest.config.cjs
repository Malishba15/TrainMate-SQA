module.exports = {
  testEnvironment: "node",
  transform: {},
  testPathIgnorePatterns: [
    "/node_modules/",
    "/tests/e2e/",
  ],
  testMatch: ["**/__tests__/**/*.test.js"],
  reporters: [
    "default",
    [
      "jest-html-reporter",
      {
        pageTitle: "TrainMate Test Report",
        outputPath: "./test-results/html-report/test-report.html",
        includeFailureMsg: true,
        includeConsoleLog: true
      }
    ]
  ],
  
};