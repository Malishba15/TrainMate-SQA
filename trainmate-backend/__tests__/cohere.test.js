import { jest } from "@jest/globals";

const mockClient = {};

const CohereClientMock = jest.fn(() => mockClient);

jest.unstable_mockModule("cohere-ai", () => ({
  CohereClient: CohereClientMock,
}));

describe("cohere.js", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  test("throws error when COHERE_API_KEY missing", async () => {
    delete process.env.COHERE_API_KEY;

    const { getCohereClient } = await import("../config/cohere.js");

    expect(() => getCohereClient()).toThrow(
      "COHERE_API_KEY missing in .env"
    );
  });

  test("creates client successfully", async () => {
    process.env.COHERE_API_KEY = "fake-token";

    const { getCohereClient } = await import("../config/cohere.js");

    const client = getCohereClient();

    expect(CohereClientMock).toHaveBeenCalledWith({
      token: "fake-token",
    });

    expect(client).toEqual(mockClient);
  });

  test("returns cached client", async () => {
    process.env.COHERE_API_KEY = "fake-token";

    const { getCohereClient } = await import("../config/cohere.js");

    const c1 = getCohereClient();
    const c2 = getCohereClient();

    expect(c1).toBe(c2);
    expect(CohereClientMock).toHaveBeenCalledTimes(1);
  });
});