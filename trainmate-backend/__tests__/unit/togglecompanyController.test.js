import { jest } from "@jest/globals";

const updateMock = jest.fn();

const docMock = jest.fn(() => ({
  update: updateMock,
}));

const collectionMock = jest.fn(() => ({
  doc: docMock,
}));

jest.unstable_mockModule("../../config/firebase.js", () => ({
  db: {
    collection: collectionMock,
  },
  admin: {},
}));

const { toggleCompanyStatus } = await import(
  "../../controllers/company-specific/togglecompanyController.js"
);

describe("toggleCompanyStatus", () => {
  let req;
  let res;

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

  test("updates company status", async () => {
    req = {
      params: { id: "company1" },
      body: { status: "inactive" },
    };

    updateMock.mockResolvedValue();

    await toggleCompanyStatus(req, res);

    expect(updateMock).toHaveBeenCalledWith({
      status: "inactive",
    });

    expect(res.json).toHaveBeenCalledWith({
      message: "Status updated",
      status: "inactive",
    });
  });

  test("returns 500 on error", async () => {
    req = {
      params: { id: "company1" },
      body: { status: "inactive" },
    };

    updateMock.mockRejectedValue(new Error("DB Error"));

    await toggleCompanyStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(500);

    expect(res.json).toHaveBeenCalledWith({
      message: "DB Error",
    });
  });
});