import express from "express";
import request from "supertest";
import { jest } from "@jest/globals";

const mockGoogleOAuthCallback = jest.fn();
const mockGenerateCompanyGoogleAuthUrl = jest.fn();
const mockCompanyGoogleOAuthCallback = jest.fn();
const mockGetLearnerInsights = jest.fn();
const mockSendAdminRegeneratedRoadmapEmail = jest.fn();
const mockSendAdminGrantedAttemptsEmail = jest.fn();
const mockSendCompanyLicenseRenewalAlertEmail = jest.fn();

await jest.unstable_mockModule("../../controllers/googleAuthController.js", () => ({
  googleOAuthCallback: mockGoogleOAuthCallback,
  generateCompanyGoogleAuthUrl: mockGenerateCompanyGoogleAuthUrl,
  companyGoogleOAuthCallback: mockCompanyGoogleOAuthCallback,
}));

await jest.unstable_mockModule("../../controllers/aiInsightsController.js", () => ({
  getLearnerInsights: mockGetLearnerInsights,
}));

await jest.unstable_mockModule("../../services/emailService.js", () => ({
  sendAdminRegeneratedRoadmapEmail: mockSendAdminRegeneratedRoadmapEmail,
  sendAdminGrantedAttemptsEmail: mockSendAdminGrantedAttemptsEmail,
  sendCompanyLicenseRenewalAlertEmail: mockSendCompanyLicenseRenewalAlertEmail,
}));

await jest.unstable_mockModule("../../config/firebase.js", () => ({
  db: {
    collection: () => ({
      doc: () => ({
        get: async () => ({ exists: () => false, data: () => null }),
      }),
    }),
  },
}));

const [{ default: authRoutes }, { default: aiInsightsRoutes }, { default: emailRoutes }] =
  await Promise.all([
    import("../../routes/authRoutes.js"),
    import("../../routes/aiInsightsRoutes.js"),
    import("../../routes/emailRoutes.js"),
  ]);

function buildTestApp() {
  const app = express();
  app.use(express.json());

  app.get("/", (req, res) => {
    res.status(200).json({ message: "TrainMate backend is running" });
  });

  app.get("/healthz", (req, res) => {
    res.status(200).json({ ok: true, service: "trainmate-backend" });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api", aiInsightsRoutes);
  app.use("/api", emailRoutes);

  return app;
}

describe("API endpoint coverage", () => {
  const app = buildTestApp();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("GET / returns backend status", async () => {
    const res = await request(app).get("/");

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("TrainMate backend is running");
  });

  test("GET /healthz returns service health payload", async () => {
    const res = await request(app).get("/healthz");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ ok: true, service: "trainmate-backend" });
  });

  test("GET /api/auth/company-google-auth-url succeeds when controller returns auth URL", async () => {
    mockGenerateCompanyGoogleAuthUrl.mockImplementation((req, res) => {
      res.status(200).json({ authUrl: "https://accounts.google.com/o/oauth2/auth?mock=1" });
    });

    const res = await request(app).get("/api/auth/company-google-auth-url?companyId=abc123");

    expect(res.statusCode).toBe(200);
    expect(res.body.authUrl).toContain("google.com");
    expect(mockGenerateCompanyGoogleAuthUrl).toHaveBeenCalledTimes(1);
  });

  test("GET /api/auth/company-google-auth-url returns 500 on controller failure", async () => {
    mockGenerateCompanyGoogleAuthUrl.mockImplementation((req, res) => {
      res.status(500).json({ error: "Unable to build auth URL" });
    });

    const res = await request(app).get("/api/auth/company-google-auth-url?companyId=abc123");

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe("Unable to build auth URL");
  });

  test("GET /api/ai-insights/:companyId/:deptId/:userId returns learner insights", async () => {
    mockGetLearnerInsights.mockImplementation((req, res) => {
      res.status(200).json({
        insights: [{ title: "Consistency", score: 92 }],
      });
    });

    const res = await request(app).get("/api/ai-insights/company-1/IT/user-1");

    expect(res.statusCode).toBe(200);
    expect(res.body.insights).toHaveLength(1);
    expect(res.body.insights[0].title).toBe("Consistency");
  });

  test("GET /api/ai-insights/:companyId/:deptId/:userId returns 500 when controller rejects the request", async () => {
    mockGetLearnerInsights.mockImplementation((req, res) => {
      res.status(500).json({ error: "Unable to load insights" });
    });

    const res = await request(app).get("/api/ai-insights/company-1/IT/user-1");

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe("Unable to load insights");
  });

  test("POST /api/email/admin-regenerated-roadmap sends email when required fields are present", async () => {
    mockSendAdminRegeneratedRoadmapEmail.mockResolvedValue({ messageId: "msg-001" });

    const res = await request(app)
      .post("/api/email/admin-regenerated-roadmap")
      .send({
        userEmail: "user@example.com",
        userName: "Ayesha",
        moduleTitle: "JavaScript Basics",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.messageId).toBe("msg-001");
    expect(mockSendAdminRegeneratedRoadmapEmail).toHaveBeenCalledTimes(1);
  });

  test("POST /api/email/admin-regenerated-roadmap returns 400 when required fields are missing", async () => {
    const res = await request(app).post("/api/email/admin-regenerated-roadmap").send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Missing required fields");
  });

  test("POST /api/email/admin-granted-attempts sends the notification email", async () => {
    mockSendAdminGrantedAttemptsEmail.mockResolvedValue({ messageId: "msg-002" });

    const res = await request(app)
      .post("/api/email/admin-granted-attempts")
      .send({
        userEmail: "user@example.com",
        userName: "Ayesha",
        moduleTitle: "JavaScript Basics",
        attemptsGranted: 2,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.messageId).toBe("msg-002");
    expect(mockSendAdminGrantedAttemptsEmail).toHaveBeenCalledTimes(1);
  });

  test("POST /api/email/admin-granted-attempts returns 400 for missing attemptsGranted", async () => {
    const res = await request(app)
      .post("/api/email/admin-granted-attempts")
      .send({
        userEmail: "user@example.com",
        userName: "Ayesha",
        moduleTitle: "JavaScript Basics",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Missing required fields");
  });

  test("POST /api/email/test-license-renewal-reminder sends a reminder email", async () => {
    mockSendCompanyLicenseRenewalAlertEmail.mockResolvedValue({ messageId: "msg-003" });

    const res = await request(app)
      .post("/api/email/test-license-renewal-reminder")
      .send({
        companyEmail: "billing@example.com",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.messageId).toBe("msg-003");
    expect(mockSendCompanyLicenseRenewalAlertEmail).toHaveBeenCalledTimes(1);
  });

  test("POST /api/email/test-license-renewal-reminder returns 400 when companyEmail is missing", async () => {
    const res = await request(app).post("/api/email/test-license-renewal-reminder").send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("companyEmail is required");
  });
});