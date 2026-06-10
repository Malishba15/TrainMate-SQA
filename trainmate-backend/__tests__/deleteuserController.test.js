import { jest } from "@jest/globals";

const getMock = jest.fn();

const collectionGroupMock = jest.fn(() => ({
  get: getMock,
}));

jest.unstable_mockModule("firebase-admin/firestore", () => ({
  getFirestore: () => ({
    collectionGroup: collectionGroupMock,
  }),
}));

jest.unstable_mockModule("firebase-admin", () => ({
  default: {
    auth: () => ({
      getUserByEmail: jest.fn(),
      deleteUser: jest.fn(),
    }),
  },
}));

const { getCompanyUsers } = await import(
  "../controllers/company-specific/deleteuserController.js"
);

describe("getCompanyUsers", () => {
  let req;
  let res;

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  test("returns 400 if companyId missing", async () => {
    req = {
      params: {},
    };

    await getCompanyUsers(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("returns users list", async () => {
    req = {
      params: {
        companyId: "c1",
      },
    };

    getMock.mockResolvedValue({
      forEach(cb) {
        cb({
          id: "u1",
          data: () => ({
            companyId: "c1",
            name: "Ali",
          }),
        });
      },
    });

    await getCompanyUsers(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });
});