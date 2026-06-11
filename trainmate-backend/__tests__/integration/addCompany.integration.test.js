import { jest } from "@jest/globals";

const mockCreateUser = jest.fn();const mockSet = jest.fn();const mockSendEmail = jest.fn();

await jest.unstable_mockModule("../../config/firebase.js", () => ({admin: {auth: () => ({createUser: mockCreateUser,}),},db: {collection: () => ({doc: () => ({set: mockSet,}),}),},}));

await jest.unstable_mockModule("../../services/emailService.js", () => ({sendCompanyCredentialsEmail: mockSendEmail,}));

const { addCompany } = await import("../../controllers/company-specific/addcompanyController.js");

describe("Add Company Integration", () => {let req;let res;

beforeEach(() => {jest.clearAllMocks();

req = {
  body: {
    name: "ABC Company",
    email: "abc@test.com",
    phone: "03001234567",
    address: "Lahore",
  },
};

res = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
};

});

test("should create auth user, firestore document and send email", async () => {mockCreateUser.mockResolvedValue({uid: "company123",});

mockSet.mockResolvedValue();
mockSendEmail.mockResolvedValue();

await addCompany(req, res);

expect(mockCreateUser).toHaveBeenCalledWith(
  expect.objectContaining({
    email: "abc@test.com",
    displayName: "ABC Company",
  })
);

expect(mockSet).toHaveBeenCalled();
expect(mockSendEmail).toHaveBeenCalled();
expect(res.status).toHaveBeenCalledWith(201);

});

test("should return 400 when required fields are missing", async () => {req.body = {};

await addCompany(req, res);

expect(res.status).toHaveBeenCalledWith(400);
expect(res.json).toHaveBeenCalledWith({
  message: "All fields are required",
});

});

test("should return 500 when firebase auth fails", async () => {mockCreateUser.mockRejectedValue(new Error("Firebase auth failed"));

await addCompany(req, res);

expect(res.status).toHaveBeenCalledWith(500);

});

test("should still create company when email sending fails", async () => {mockCreateUser.mockResolvedValue({uid: "company123",});

mockSet.mockResolvedValue();

mockSendEmail.mockRejectedValue(
  new Error("Email failed")
);

await addCompany(req, res);

expect(mockCreateUser).toHaveBeenCalled();
expect(mockSet).toHaveBeenCalled();
expect(res.status).toHaveBeenCalledWith(201);

});

test("should save company document to firestore", async () => {mockCreateUser.mockResolvedValue({uid: "company123",});

mockSet.mockResolvedValue();
mockSendEmail.mockResolvedValue();

await addCompany(req, res);

expect(mockSet).toHaveBeenCalledTimes(1);

});});