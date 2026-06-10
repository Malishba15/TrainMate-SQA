import { jest } from "@jest/globals";
import { submitQuiz } from "../controllers/quizController.js";

// Mock Firebase
jest.mock("../config/firebase.js", () => ({
  db: {
    collection: jest.fn(),
  },
}));

describe("submitQuiz", () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      body: {
        companyId: "company1",
        deptId: "dept1",
        userId: "user1",
        moduleId: "module1",
        quizId: "quiz1",
        answers: {
          mcq: [],
          oneLiners: [],
          coding: [],
        },
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  test("should return 400 if required IDs are missing", async () => {
    req.body.companyId = "";

    await submitQuiz(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Missing required IDs",
    });
  });
});