import { jest } from "@jest/globals";

// ---------------- MOCKS ----------------

const mockCompanyGet = jest.fn();
const mockRecursiveDelete = jest.fn();
const mockCollectionGroupGet = jest.fn();
const mockDepartmentsGet = jest.fn();
const mockDeleteUser = jest.fn();
const mockListUsers = jest.fn();

jest.unstable_mockModule("../config/firebase.js", () => ({
  db: {
    collection: jest.fn((name) => {
      if (name === "companies") {
        return {
          doc: jest.fn(() => ({
            get: mockCompanyGet,
          })),
        };
      }

      if (name === "freshers") {
        return {
          doc: jest.fn(() => ({
            collection: jest.fn(() => ({
              get: mockDepartmentsGet,
            })),
          })),
        };
      }

      return {};
    }),

    collectionGroup: jest.fn(() => ({
      where: jest.fn(() => ({
        get: mockCollectionGroupGet,
      })),
    })),

    recursiveDelete: mockRecursiveDelete,
  },

  admin: {
    auth: jest.fn(() => ({
      listUsers: mockListUsers,
      deleteUser: mockDeleteUser,
      getUserByEmail: jest.fn(),
    })),
  },
}));

const { deleteCompany } = await import(
  "../controllers/company-specific/deletecompanyController.js"
);

// ---------------- TESTS ----------------

describe("deleteCompany Controller", () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      params: {
        id: "company123",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

  test("should delete company successfully", async () => {
    mockCompanyGet.mockResolvedValue({
      exists: true,
      data: () => ({
        email: "company@test.com",
      }),
    });

    mockCollectionGroupGet.mockResolvedValue({
      docs: [],
    });

    mockDepartmentsGet.mockResolvedValue({
      docs: [],
    });

    mockListUsers.mockResolvedValue({
      users: [],
      pageToken: undefined,
    });

    mockRecursiveDelete.mockResolvedValue();

    await deleteCompany(req, res);

    expect(mockRecursiveDelete).toHaveBeenCalledTimes(2);

    expect(res.json).toHaveBeenCalledWith({
      message: "Company and all company users deleted successfully",
      companyId: "company123",
      deletedUsersCount: 0,
      deletedAuthUsers: 0,
    });
  });

  test("should return 500 when Firestore throws an error", async () => {
    mockCompanyGet.mockRejectedValue(new Error("Firestore failed"));

    await deleteCompany(req, res);

    expect(res.status).toHaveBeenCalledWith(500);

    expect(res.json).toHaveBeenCalledWith({
      message: "Firestore failed",
    });
  });
});