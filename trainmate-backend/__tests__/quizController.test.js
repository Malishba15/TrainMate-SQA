// tests/quizController.test.js

import {
  normalizeDepartmentKey,
  normalizeLicensePlan,
  calculateQuizUnlockTime,
  checkQuizTimeUnlock,
  isQuizComplete,
} from "../controllers/QuizController.js";


describe("QuizController Helper Functions", () => {
  
  describe("normalizeDepartmentKey()", () => {
    test("should convert department name to uppercase without spaces", () => {
      expect(normalizeDepartmentKey("Software Development"))
        .toBe("SOFTWAREDEVELOPMENT");
    });

    test("should return empty string for null input", () => {
      expect(normalizeDepartmentKey(null)).toBe("");
    });
  });

  describe("normalizeLicensePlan()", () => {
    test("should normalize License Pro", () => {
      expect(normalizeLicensePlan("pro")).toBe("License Pro");
    });

    test("should normalize License Basic", () => {
      expect(normalizeLicensePlan("basic")).toBe("License Basic");
    });

    test("should return null for invalid plan", () => {
      expect(normalizeLicensePlan("premium")).toBeNull();
    });
  });

  describe("calculateQuizUnlockTime()", () => {
    test("should calculate unlock time at 70% of module duration", () => {
      const startDate = new Date("2026-01-01");
      const result = calculateQuizUnlockTime(startDate, 10);

      const expected = new Date(
        startDate.getTime() + (10 * 0.7 * 24 * 60 * 60 * 1000)
      );

      expect(result.getTime()).toBe(expected.getTime());
    });
  });

  describe("checkQuizTimeUnlock()", () => {
    test("should return unlocked when threshold passed", () => {
      const moduleData = {
        startedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        estimatedDays: 5,
      };

      const result = checkQuizTimeUnlock(moduleData);

      expect(result.isUnlocked).toBe(true);
      expect(result.message).toBe("Quiz is now available!");
    });

    test("should return locked when threshold not reached", () => {
      const moduleData = {
        startedAt: new Date(),
        estimatedDays: 10,
      };

      const result = checkQuizTimeUnlock(moduleData);

      expect(result.isUnlocked).toBe(false);
      expect(result.issueType).toBe("time_limit_exceeded");
    });
  });

  describe("isQuizComplete()", () => {
    test("should return true for valid quiz", () => {
      const quiz = {
        mcq: Array.from({ length: 5 }, (_, i) => ({
          question: `Q${i}`,
          options: ["A", "B", "C", "D"],
          correctIndex: 0,
        })),
        oneLiners: [
          { question: "OL1", answer: "Ans1" },
          { question: "OL2", answer: "Ans2" },
        ],
      };

      expect(isQuizComplete(quiz, false)).toBe(true);
    });

    test("should return false for insufficient MCQs", () => {
      const quiz = {
        mcq: [
          {
            question: "Q1",
            options: ["A", "B", "C", "D"],
            correctIndex: 0,
          },
        ],
        oneLiners: [
          { question: "OL1", answer: "Ans1" },
          { question: "OL2", answer: "Ans2" },
        ],
      };

      expect(isQuizComplete(quiz, false)).toBe(false);
    });

    test("should reject coding questions for non-coding department", () => {
      const quiz = {
        mcq: Array.from({ length: 5 }, (_, i) => ({
          question: `Q${i}`,
          options: ["A", "B", "C", "D"],
          correctIndex: 0,
        })),
        oneLiners: [
          { question: "OL1", answer: "Ans1" },
          { question: "OL2", answer: "Ans2" },
        ],
        coding: [
          {
            question: "Write a function",
            expectedApproach: "Use loop",
            language: "JavaScript",
          },
        ],
      };

      expect(isQuizComplete(quiz, false)).toBe(false);
    });
  });

});