import { isDocAllowed } from "../utils/relevanceGuard.js";

describe("isDocAllowed", () => {
  test("returns false when departments do not match", () => {
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

  test("returns false when modules do not match", () => {
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

  test("returns true when department and module match with high similarity", () => {
    expect(
      isDocAllowed({
        similarityScore: 0.8,
        docDepartment: "IT",
        docModule: "Module1",
        userDepartment: "IT",
        userModule: "Module1",
      })
    ).toBe(true);
  });

  test("returns true when department and module match with low similarity", () => {
    expect(
      isDocAllowed({
        similarityScore: 0.1,
        docDepartment: "IT",
        docModule: "Module1",
        userDepartment: "IT",
        userModule: "Module1",
      })
    ).toBe(true);
  });

  test("returns true when similarity is exactly 0.25 and department/module match", () => {
    expect(
      isDocAllowed({
        similarityScore: 0.25,
        docDepartment: "IT",
        docModule: "Module1",
        userDepartment: "IT",
        userModule: "Module1",
      })
    ).toBe(true);
  });
});