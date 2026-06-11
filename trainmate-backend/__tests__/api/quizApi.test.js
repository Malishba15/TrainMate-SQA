import express from "express";
import request from "supertest";

const app = express();
app.use(express.json());

app.get("/healthz", (req, res) => {
  res.status(200).json({
    ok: true,
    service: "trainmate-backend",
  });
});

describe("Health API", () => {
  test("GET /healthz should return 200", async () => {
    const response = await request(app).get("/healthz");

    expect(response.statusCode).toBe(200);
    expect(response.body.ok).toBe(true);
  });
});