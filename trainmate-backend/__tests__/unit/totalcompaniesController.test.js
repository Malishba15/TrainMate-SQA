import { jest } from "@jest/globals";

// Mock firebase
const getMock = jest.fn();
const collectionMock = jest.fn(() => ({
  get: getMock,
}));

const firestoreMock = jest.fn(() => ({
  collection: collectionMock,
}));

jest.unstable_mockModule("../../config/firebase.js", () => ({
  admin: {
    firestore: firestoreMock,
  },
  db: {},
}));

const { getTotalCompanies } = await import(
  "../../controllers/company-specific/totalcompaniesController.js"
);

describe("getTotalCompanies", () => {
  let req;
  let res;

  beforeEach(() => {
    req = {};

    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    jest.clearAllMocks();
  });

  test("returns total company count", async () => {
    getMock.mockResolvedValue({
      size: 5,
    });

    await getTotalCompanies(req, res);

    expect(res.json).toHaveBeenCalledWith({
      count: 5,
    });
  });

  test("returns 500 on firestore error", async () => {
    getMock.mockRejectedValue(new Error("Firestore failed"));

    await getTotalCompanies(req, res);

    expect(res.status).toHaveBeenCalledWith(500);

    expect(res.json).toHaveBeenCalledWith({
      error: "Failed to fetch companies count",
    });
  });
});