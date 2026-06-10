import { jest } from "@jest/globals";

const getMock = jest.fn();

const collectionMock = jest.fn(() => ({
  get: getMock,
}));

const firestoreMock = jest.fn(() => ({
  collection: collectionMock,
}));

jest.unstable_mockModule("../config/firebase.js", () => ({
  admin: {
    firestore: firestoreMock,
  },
  db: {},
}));

const { getTotalSuperAdmins } = await import(
  "../controllers/superadmin/totalsuperAdminsController.js"
);

describe("getTotalSuperAdmins", () => {
  let req;
  let res;

  beforeEach(() => {
    req = {};

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

  test("should return total super admin count", async () => {
    getMock.mockResolvedValue({
      size: 7,
    });

    await getTotalSuperAdmins(req, res);

    expect(collectionMock).toHaveBeenCalledWith(
      "super_admins"
    );

    expect(res.json).toHaveBeenCalledWith({
      count: 7,
    });
  });

  test("should return 500 on firestore error", async () => {
    getMock.mockRejectedValue(
      new Error("Firestore error")
    );

    await getTotalSuperAdmins(req, res);

    expect(res.status).toHaveBeenCalledWith(500);

    expect(res.json).toHaveBeenCalledWith({
      error: "Failed to fetch super admins count",
    });
  });
});