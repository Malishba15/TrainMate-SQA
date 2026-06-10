import request from "supertest";
import app from "../app.js";

describe("Health Endpoint", () => {
  test("GET /healthz should return status 200", async () => {
    const res = await request(app).get("/healthz");

    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.service).toBe("trainmate-backend");
  });
});