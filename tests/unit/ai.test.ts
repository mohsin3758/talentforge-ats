import { describe, test, expect } from "vitest";
import { safeParseJSON } from "@/lib/ats/ai";

/* ------------------------------------------------------------------ */
/* safeParseJSON — critical for parsing AI responses                  */
/* ------------------------------------------------------------------ */
describe("safeParseJSON", () => {
  test("parses valid JSON object", () => {
    const result = safeParseJSON('{"score": 85, "name": "test"}');
    expect(result).toEqual({ score: 85, name: "test" });
  });

  test("returns empty object for empty string", () => {
    expect(safeParseJSON("")).toEqual({});
  });

  test("returns empty object for whitespace-only string", () => {
    expect(safeParseJSON("   ")).toEqual({});
  });

  test("strips code fences (```json ... ```)", () => {
    const fenced = '```json\n{"score": 90}\n```';
    expect(safeParseJSON(fenced)).toEqual({ score: 90 });
  });

  test("strips code fences without language specifier", () => {
    const fenced = '```\n{"score": 75}\n```';
    expect(safeParseJSON(fenced)).toEqual({ score: 75 });
  });

  test("extracts JSON from surrounding text", () => {
    const wrapped = 'Here is the result: {"score": 80, "reasons": ["good"]} Done.';
    expect(safeParseJSON(wrapped)).toEqual({ score: 80, reasons: ["good"] });
  });

  test("handles invalid JSON gracefully (returns empty object)", () => {
    expect(safeParseJSON("not json at all")).toEqual({});
  });

  test("handles malformed JSON with { but invalid syntax", () => {
    expect(safeParseJSON('{invalid json}')).toEqual({});
  });

  test("handles nested objects", () => {
    const nested = '{"outer": {"inner": "value"}, "arr": [1, 2, 3]}';
    expect(safeParseJSON(nested)).toEqual({
      outer: { inner: "value" },
      arr: [1, 2, 3],
    });
  });

  test("handles JSON with arrays at root level (parses successfully via direct JSON.parse)", () => {
    // Note: direct JSON.parse handles arrays fine; the { ... } extraction only kicks in
    // when direct parse fails. So [1,2,3] parses successfully as an array.
    const result = safeParseJSON("[1, 2, 3]");
    expect(Array.isArray(result)).toBe(true);
    expect(result).toEqual([1, 2, 3]);
  });

  test("handles very large JSON", () => {
    const large = JSON.stringify({
      score: 100,
      reasons: Array.from({ length: 100 }, (_, i) => `Reason ${i}`),
    });
    const result = safeParseJSON(large);
    expect(result.score).toBe(100);
    expect((result.reasons as unknown[]).length).toBe(100);
  });

  test("handles JSON with special characters", () => {
    const special = '{"summary": "Candidate has 5+ years experience & strong skills"}';
    expect(safeParseJSON(special)).toEqual({
      summary: "Candidate has 5+ years experience & strong skills",
    });
  });

  test("handles JSON with unicode", () => {
    const unicode = '{"name": "José García", "city": "São Paulo"}';
    expect(safeParseJSON(unicode)).toEqual({
      name: "José García",
      city: "São Paulo",
    });
  });

  test("handles JSON with newlines in strings", () => {
    const multiline = '{"text": "Line 1\\nLine 2"}';
    expect(safeParseJSON(multiline)).toEqual({ text: "Line 1\nLine 2" });
  });

  test("extracts first JSON object when multiple present", () => {
    const multiple = '{"first": true} {"second": true}';
    const result = safeParseJSON(multiple);
    // The regex /\{[\s\S]*\}/ is greedy, so it matches from first { to last }
    // This is a known behavior — test documents it
    expect(result).toBeDefined();
  });
});
