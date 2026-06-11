import { getModuleStatus } from "../../utils/status.util.js";

describe("getModuleStatus", () => {
  test("returns 'Completed' when module is completed", () => {
    const module = {
      completed: true,
      quizGenerated: true,
    };

    expect(getModuleStatus(module)).toBe("Completed");
  });

  test("returns 'In Progress' when quiz is generated but module is not completed", () => {
    const module = {
      completed: false,
      quizGenerated: true,
    };

    expect(getModuleStatus(module)).toBe("In Progress");
  });

  test("returns 'Not Started' when neither completed nor quiz generated", () => {
    const module = {
      completed: false,
      quizGenerated: false,
    };

    expect(getModuleStatus(module)).toBe("Not Started");
  });
});