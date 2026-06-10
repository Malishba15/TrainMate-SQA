import { jest } from "@jest/globals";

const firestoreMock = jest.fn(() => ({}));

const initializeAppMock = jest.fn();

const certMock = jest.fn();

jest.unstable_mockModule("firebase-admin", () => ({
  default: {
    apps: [],
    initializeApp: initializeAppMock,
    credential: {
      cert: certMock,
    },
    firestore: firestoreMock,
  },
}));

jest.unstable_mockModule("fs", () => ({
  default: {
    existsSync: jest.fn(() => false),
    readFileSync: jest.fn(),
  },
}));

describe("firebase.js", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  test("initializes firebase with default credentials when service account missing", async () => {
    await import("../config/firebase.js");

    expect(initializeAppMock).toHaveBeenCalled();
  });

  test("exports firestore instance", async () => {
    const module = await import("../config/firebase.js");

    expect(module.db).toBeDefined();
  });

  test("exports admin object", async () => {
    const module = await import("../config/firebase.js");

    expect(module.admin).toBeDefined();
  });
});