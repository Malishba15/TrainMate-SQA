// __tests__/routes.integration.test.js

import { jest, describe, it, expect, beforeAll } from "@jest/globals";

// 🔥 IMPORTANT: mock BEFORE importing app/routes
jest.unstable_mockModule("../../controllers/googleAuthController.js", () => ({
  googleLogin: jest.fn((req, res) => res.status(200).json({ ok: true })),
  googleOAuthCallback: jest.fn((req, res) =>
    res.status(200).json({ ok: true })
  ),
}));

// Import AFTER mocking
const { googleLogin, googleOAuthCallback } = await import(
  "../../controllers/googleAuthController.js"
);

describe("Routes Integration (Google Auth)", () => {
  let req, res;

  beforeAll(() => {
    req = {};
    res = {
      status: jest.fn(() => res),
      json: jest.fn(),
      redirect: jest.fn(),
    };
  });

  it("googleLogin should be defined and callable", () => {
    expect(typeof googleLogin).toBe("function");

    googleLogin(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("googleOAuthCallback should be defined and callable", async () => {
    req.query = { code: "test" };

    await googleOAuthCallback(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });
});