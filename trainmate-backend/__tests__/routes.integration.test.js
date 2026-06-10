import request from "supertest";
import app from "../app.js";

describe("Basic Route Integration Tests", () => {

  test("GET / should return backend running message", async () => {
    const res = await request(app).get("/");

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("TrainMate backend is running");
  });

  test("GET /healthz returns JSON", async () => {
    const res = await request(app).get("/healthz");

    expect(res.headers["content-type"]).toMatch(/json/);
  });

  test("GET invalid route returns 404", async () => {
    const res = await request(app).get("/this-route-does-not-exist");

    expect(res.statusCode).toBe(404);
  });

  test("POST invalid auth endpoint returns 404", async () => {
    const res = await request(app)
      .post("/api/auth/invalid-endpoint")
      .send({});

    expect(res.statusCode).toBe(404);
  });

});