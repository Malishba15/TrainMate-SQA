import { jest } from "@jest/globals";

const updateMock = jest.fn();
const docMock = jest.fn(() => ({
  update: updateMock,
}));
const collectionMock = jest.fn(() => ({
  doc: docMock,
}));

const updateUserMock = jest.fn();

jest.unstable_mockModule("../config/firebase.js", () => ({
  db: {
    collection: collectionMock,
  },
  admin: {
    auth: () => ({
      updateUser: updateUserMock,
    }),
  },
}));

const { updateCompany } = await import(
  "../controllers/company-specific/updateCompanyController.js"
);

describe("updateCompany", () => {
  let req;
  let res;

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

  test("returns 400 if fields are missing", async () => {
    req = {
      params: { id: "123" },
      body: {},
    };

    await updateCompany(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "All fields are required",
    });
  });

  test("updates company successfully", async () => {
    req = {
      params: { id: "123" },
      body: {
        name: "ABC",
        email: "abc@test.com",
        phone: "123",
        address: "Lahore",
      },
    };

    updateMock.mockResolvedValue();
    updateUserMock.mockResolvedValue();

    await updateCompany(req, res);

    expect(updateMock).toHaveBeenCalled();
    expect(updateUserMock).toHaveBeenCalled();

    expect(res.json).toHaveBeenCalledWith({
      message: "Company updated!",
    });
  });

  test("returns 500 when update fails", async () => {
    req = {
      params: { id: "123" },
      body: {
        name: "ABC",
        email: "abc@test.com",
        phone: "123",
        address: "Lahore",
      },
    };

    updateMock.mockRejectedValue(new Error("Firestore Error"));

    await updateCompany(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Firestore Error",
    });
  });
});