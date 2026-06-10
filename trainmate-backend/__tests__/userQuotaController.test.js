import { jest } from "@jest/globals";

const checkUserQuotaMock = jest.fn();

jest.unstable_mockModule("../utils/userQuotaChecker.js", () => ({
  checkUserQuota: checkUserQuotaMock,
}));

const { checkCompanyUserQuota } = await import(
  "../controllers/company-specific/userQuotaController.js"
);

describe("checkCompanyUserQuota", () => {
  let req;
  let res;

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

  test("returns 400 if companyId missing", async () => {
    req = {
      params: {},
    };

    await checkCompanyUserQuota(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("returns quota status", async () => {
    req = {
      params: {
        companyId: "abc123",
      },
    };

    checkUserQuotaMock.mockResolvedValue({
      allowed: true,
      currentUsers: 5,
      maxUsers: 10,
    });

    await checkCompanyUserQuota(req, res);

    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.json).toHaveBeenCalledWith({
      allowed: true,
      currentUsers: 5,
      maxUsers: 10,
    });
  });

  test("returns 500 on error", async () => {
    req = {
      params: {
        companyId: "abc123",
      },
    };

    checkUserQuotaMock.mockRejectedValue(
      new Error("Something went wrong")
    );

    await checkCompanyUserQuota(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});