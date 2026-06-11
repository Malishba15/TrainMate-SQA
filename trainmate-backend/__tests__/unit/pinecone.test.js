import { jest } from "@jest/globals";

const mockIndex = { name: "mock-index" };

const mockPinecone = {
  listIndexes: jest.fn(),
  createIndex: jest.fn(),
  Index: jest.fn(() => mockIndex),
};

jest.unstable_mockModule("@pinecone-database/pinecone", () => ({
  Pinecone: jest.fn(() => mockPinecone),
}));

describe("pinecone.js", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  test("returns null when API key is missing", async () => {
    delete process.env.PINECONE_API_KEY;

    const { initPinecone } = await import("../../config/pinecone.js");

    const result = await initPinecone();

    expect(result).toBeNull();
  });

  test("creates index if it does not exist", async () => {
    process.env.PINECONE_API_KEY = "fake-key";

    mockPinecone.listIndexes.mockResolvedValue({
      indexes: [],
    });

    const { initPinecone } = await import("../../config/pinecone.js");

    const result = await initPinecone();

    expect(mockPinecone.createIndex).toHaveBeenCalled();
    expect(result).toEqual(mockIndex);
  });

  test("uses existing index if already exists", async () => {
    process.env.PINECONE_API_KEY = "fake-key";

    mockPinecone.listIndexes.mockResolvedValue({
      indexes: [{ name: "train-mate15" }],
    });

    const { initPinecone } = await import("../../config/pinecone.js");

    const result = await initPinecone();

    expect(mockPinecone.createIndex).not.toHaveBeenCalled();
    expect(result).toEqual(mockIndex);
  });

  test("returns null when Pinecone throws error", async () => {
    process.env.PINECONE_API_KEY = "fake-key";

    mockPinecone.listIndexes.mockRejectedValue(
      new Error("Pinecone failed")
    );

    const { initPinecone } = await import("../../config/pinecone.js");

    const result = await initPinecone();

    expect(result).toBeNull();
  });
});