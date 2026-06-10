import { getModuleStatus } from "../utils/status.util.js";
import { chunkText } from "../utils/chunkText.js";
import { isDocAllowed } from "../utils/relevanceGuard.js";

describe("Negative and Edge Case Tests", () => {
  test("getModuleStatus handles empty object", () => {
    expect(getModuleStatus({})).toBe("Not Started");
  });

  test("getModuleStatus handles null values", () => {
    expect(
      getModuleStatus({
        completed: null,
        quizGenerated: null,
      })
    ).toBe("Not Started");
  });

  test("chunkText handles empty string", () => {
    expect(chunkText("")).toEqual([""]);
  });

  test("chunkText handles single word", () => {
    expect(chunkText("hello")).toEqual(["hello"]);
  });

  test("chunkText handles very small chunk size", () => {
    const result = chunkText("one two three four", 1, 0);
    expect(result.length).toBeGreaterThan(0);
  });

  test("isDocAllowed returns false for department mismatch", () => {
    expect(
      isDocAllowed({
        similarityScore: 0.9,
        docDepartment: "HR",
        docModule: "Module1",
        userDepartment: "IT",
        userModule: "Module1",
      })
    ).toBe(false);
  });

  test("isDocAllowed returns false for module mismatch", () => {
    expect(
      isDocAllowed({
        similarityScore: 0.9,
        docDepartment: "IT",
        docModule: "Module2",
        userDepartment: "IT",
        userModule: "Module1",
      })
    ).toBe(false);
  });

  test("isDocAllowed allows low similarity when department and module match", () => {
    expect(
      isDocAllowed({
        similarityScore: 0.05,
        docDepartment: "IT",
        docModule: "Module1",
        userDepartment: "IT",
        userModule: "Module1",
      })
    ).toBe(true);
  });

  test("chunkText returns array for whitespace string", () => {
    expect(Array.isArray(chunkText("   "))).toBe(true);
  });

  test("getModuleStatus handles undefined properties", () => {
    expect(
      getModuleStatus({
        completed: undefined,
        quizGenerated: undefined,
      })
    ).toBe("Not Started");
  });
});