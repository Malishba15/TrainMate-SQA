import { jest } from "@jest/globals";

const pdfMock = jest.fn();
const emailMock = jest.fn();

jest.unstable_mockModule("../services/pdfService.js", () => ({
  generateUserCredentialsPDF: pdfMock,
}));

jest.unstable_mockModule("../services/emailService.js", () => ({
  sendUserCredentialsEmail: emailMock,
}));

const { sendUserCredentials } = await import(
  "../controllers/company-specific/sendCredentialsController.js"
);

describe("sendUserCredentials", () => {
  let req;
  let res;

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

  test("returns 400 when required fields are missing", async () => {
    req = {
      body: {},
    };

    await sendUserCredentials(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("returns success when email sent", async () => {
    req = {
      body: {
        userName: "Ali",
        userEmail: "ali@test.com",
        userId: "1",
        password: "123456",
        companyName: "ABC",
      },
    };

    pdfMock.mockResolvedValue(Buffer.from("pdf"));
    emailMock.mockResolvedValue();

    await sendUserCredentials(req, res);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
    });
  });

  test("returns 500 on exception", async () => {
    req = {
      body: {
        userName: "Ali",
        userEmail: "ali@test.com",
        userId: "1",
        password: "123456",
        companyName: "ABC",
      },
    };

    pdfMock.mockRejectedValue(new Error("PDF failed"));

    await sendUserCredentials(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});