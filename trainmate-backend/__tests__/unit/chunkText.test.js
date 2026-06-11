import { chunkText } from "../../utils/chunkText.js";

describe("chunkText", () => {
  test("returns one chunk for short text", () => {
    const text = "hello world";
    const result = chunkText(text, 10, 2);

    expect(result).toEqual(["hello world"]);
  });

  test("splits text into multiple chunks", () => {
    const text = Array(20).fill("word").join(" ");
    const result = chunkText(text, 5, 1);

    expect(result.length).toBeGreaterThan(1);
  });

  test("returns an array", () => {
    const result = chunkText("sample text");

    expect(Array.isArray(result)).toBe(true);
  });

  test("handles empty string input", () => {
    const result = chunkText("");

    expect(result).toEqual([""]);
  });
});

test("returns correct chunk for exact size input", () => {
  const text = Array(5).fill("word").join(" ");
  const result = chunkText(text, 5, 1);

  expect(result[0]).toBe(text);
});

test("handles custom overlap correctly", () => {
  const text = Array(15).fill("test").join(" ");
  const result = chunkText(text, 5, 2);

  expect(result.length).toBeGreaterThan(1);
});

test("returns non-empty array for single word", () => {
  const result = chunkText("hello", 5, 1);

  expect(result.length).toBe(1);
  expect(result[0]).toBe("hello");
});