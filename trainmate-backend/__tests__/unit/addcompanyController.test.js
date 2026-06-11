import { jest } from "@jest/globals";

// ---------- Mocks ----------

const createUserMock = jest.fn();
const setMock = jest.fn();
const docMock = jest.fn(() => ({
  set: setMock,
}));
const collectionMock = jest.fn(() => ({
  doc: docMock,
}));

const sendCompanyCredentialsEmailMock = jest.fn();

jest.unstable_mockModule("../../config/firebase.js", () => ({
  db: {
    collection: collectionMock,
  },
  admin: {
    auth: () => ({
      createUser: createUserMock,
    }),
  },
}));

jest.unstable_mockModule("../../services/emailService.js", () => ({
  sendCompanyCredentialsEmail: sendCompanyCredentialsEmailMock,
}));

const { addCompany } = await import(
  "../../controllers/company-specific/addcompanyController.js"
);

describe("addCompany", () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      body: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

  test("should return 400 when required fields are missing", async () => {
    req.body = {
      name: "ABC",
    };

    await addCompany(req, res);

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      message: "All fields are required",
    });
  });

  test("should create company successfully", async () => {
    req.body = {
      name: "ABC Company",
      email: "abc@test.com",
      phone: "123456789",
      address: "Lahore",
    };

    createUserMock.mockResolvedValue({
      uid: "company123",
    });

    setMock.mockResolvedValue();

    sendCompanyCredentialsEmailMock.mockResolvedValue();

    await addCompany(req, res);

    expect(createUserMock).toHaveBeenCalled();

    expect(collectionMock).toHaveBeenCalledWith("companies");

    expect(docMock).toHaveBeenCalledWith("company123");

    expect(setMock).toHaveBeenCalled();

    expect(sendCompanyCredentialsEmailMock).toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(201);
  });

  test("should return 500 if firebase createUser fails", async () => {
    req.body = {
      name: "ABC Company",
      email: "abc@test.com",
      phone: "123456789",
      address: "Lahore",
    };

    createUserMock.mockRejectedValue(
      new Error("Firebase failed")
    );

    await addCompany(req, res);

    expect(res.status).toHaveBeenCalledWith(500);

    expect(res.json).toHaveBeenCalledWith({
      message: "Firebase failed",
    });
  });

  test("should still succeed if email sending fails", async () => {
    req.body = {
      name: "ABC Company",
      email: "abc@test.com",
      phone: "123456789",
      address: "Lahore",
    };

    createUserMock.mockResolvedValue({
      uid: "company123",
    });

    setMock.mockResolvedValue();

    sendCompanyCredentialsEmailMock.mockRejectedValue(
      new Error("Email failed")
    );

    await addCompany(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
  });
});