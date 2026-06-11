// __tests__/googleAuthController.test.js

import { jest, describe, it, expect, beforeEach } from "@jest/globals";

// Mock axios BEFORE importing controller
jest.unstable_mockModule("axios", () => ({
  default: {
    post: jest.fn(),
  },
}));

// Mock jsonwebtoken
jest.unstable_mockModule("jsonwebtoken", () => ({
  default: {
    decode: jest.fn(),
    sign: jest.fn(),
  },
}));

const axios = (await import("axios")).default;
const jwt = (await import("jsonwebtoken")).default;

const {
  googleLogin,
  googleOAuthCallback,
} = await import("../../controllers/googleAuthController.js");

describe("Google Auth Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      query: {},
    };

    res = {
      redirect: jest.fn(),
      status: jest.fn(() => res),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

  describe("googleLogin", () => {
    it("should redirect to Google OAuth URL", () => {
      process.env.GOOGLE_CLIENT_ID = "test-client";
      process.env.GOOGLE_REDIRECT_URI = "http://localhost/callback";

      googleLogin(req, res);

      expect(res.redirect).toHaveBeenCalled();
    });
  });

  describe("googleOAuthCallback", () => {
    it("should return 400 if code is missing", async () => {
      req.query = {};

      await googleOAuthCallback(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should authenticate user successfully", async () => {
      req.query = { code: "test-code" };

      axios.post.mockResolvedValue({
        data: {
          id_token: "fake-token",
        },
      });

      jwt.decode.mockReturnValue({
        email: "test@example.com",
        name: "Test User",
        picture: "img.png",
      });

      jwt.sign.mockReturnValue("app-token");

      process.env.JWT_SECRET = "secret";

      await googleOAuthCallback(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });

    it("should handle errors", async () => {
      req.query = { code: "test" };

      axios.post.mockRejectedValue(new Error("OAuth failed"));

      await googleOAuthCallback(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});