import { describe, test, expect } from "vitest";
import {
  formatCurrency,
  formatSalaryRange,
  formatDate,
  formatDateTime,
  relativeTime,
  initials,
  daysBetween,
  truncate,
} from "@/lib/ats/format";

/* ------------------------------------------------------------------ */
/* formatCurrency                                                      */
/* ------------------------------------------------------------------ */
describe("formatCurrency", () => {
  test("formats USD with $ prefix and no decimals", () => {
    expect(formatCurrency(120000)).toBe("$120,000");
    expect(formatCurrency(0)).toBe("$0");
  });

  test("returns em dash for null/undefined", () => {
    expect(formatCurrency(null)).toBe("—");
    expect(formatCurrency(undefined)).toBe("—");
  });

  test("supports other currencies", () => {
    expect(formatCurrency(1000, "EUR")).toMatch(/1,000/);
  });
});

/* ------------------------------------------------------------------ */
/* formatSalaryRange                                                   */
/* ------------------------------------------------------------------ */
describe("formatSalaryRange", () => {
  test("returns 'Not disclosed' when both null", () => {
    expect(formatSalaryRange(null, null)).toBe("Not disclosed");
  });

  test("returns 'Up to X' when only max", () => {
    expect(formatSalaryRange(null, 100000)).toBe("Up to $100,000");
  });

  test("returns 'From X' when only min", () => {
    expect(formatSalaryRange(80000, null)).toBe("From $80,000");
  });

  test("returns range when both present", () => {
    expect(formatSalaryRange(80000, 120000)).toBe("$80,000 – $120,000");
  });
});

/* ------------------------------------------------------------------ */
/* formatDate                                                          */
/* ------------------------------------------------------------------ */
describe("formatDate", () => {
  test("formats date string correctly", () => {
    const result = formatDate("2026-01-15");
    expect(result).toContain("Jan");
    expect(result).toContain("15");
    expect(result).toContain("2026");
  });

  test("accepts Date object", () => {
    const result = formatDate(new Date("2026-06-15"));
    expect(result).toContain("Jun");
  });

  test("accepts custom options", () => {
    const result = formatDate("2026-01-15", { weekday: "long" });
    expect(result).toMatch(/Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday/);
  });
});

/* ------------------------------------------------------------------ */
/* formatDateTime                                                      */
/* ------------------------------------------------------------------ */
describe("formatDateTime", () => {
  test("includes date and time", () => {
    const result = formatDateTime("2026-01-15T14:30:00");
    expect(result).toContain("Jan");
    expect(result).toContain("15");
    expect(result).toMatch(/\d/); // has a time digit
  });
});

/* ------------------------------------------------------------------ */
/* relativeTime                                                        */
/* ------------------------------------------------------------------ */
describe("relativeTime", () => {
  test("returns 'just now' for < 60 seconds", () => {
    const tenSecondsAgo = new Date(Date.now() - 10 * 1000);
    expect(relativeTime(tenSecondsAgo)).toBe("just now");
  });

  test("returns minutes for < 60 minutes", () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    expect(relativeTime(fiveMinutesAgo)).toBe("5m ago");
  });

  test("returns hours for < 24 hours", () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
    expect(relativeTime(threeHoursAgo)).toBe("3h ago");
  });

  test("returns days for < 7 days", () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    expect(relativeTime(twoDaysAgo)).toBe("2d ago");
  });

  test("returns weeks for < 4 weeks", () => {
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    expect(relativeTime(twoWeeksAgo)).toBe("2w ago");
  });

  test("returns months for < 12 months", () => {
    const threeMonthsAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    expect(relativeTime(threeMonthsAgo)).toBe("3mo ago");
  });

  test("returns years for >= 365 days", () => {
    const twoYearsAgo = new Date(Date.now() - 730 * 24 * 60 * 60 * 1000);
    expect(relativeTime(twoYearsAgo)).toBe("2y ago");
  });

  test("accepts ISO string", () => {
    const result = relativeTime(new Date(Date.now() - 5 * 1000).toISOString());
    expect(result).toBe("just now");
  });
});

/* ------------------------------------------------------------------ */
/* initials                                                            */
/* ------------------------------------------------------------------ */
describe("initials", () => {
  test("returns first 2 letters of first 2 words", () => {
    expect(initials("Jane Doe")).toBe("JD");
    expect(initials("John Ronald Reuel Tolkien")).toBe("JR");
  });

  test("handles single name", () => {
    expect(initials("Madonna")).toBe("M");
  });

  test("handles empty string", () => {
    expect(initials("")).toBe("");
  });

  test("handles extra whitespace", () => {
    expect(initials("  Jane   Doe  ")).toBe("JD");
  });

  test("handles names with hyphens", () => {
    expect(initials("Mary-Jane Watson")).toBe("MW");
  });
});

/* ------------------------------------------------------------------ */
/* daysBetween                                                         */
/* ------------------------------------------------------------------ */
describe("daysBetween", () => {
  test("counts days between two dates", () => {
    expect(daysBetween("2026-01-01", "2026-01-08")).toBe(7);
    expect(daysBetween("2026-01-01", "2026-02-01")).toBe(31);
  });

  test("returns 0 when dates are same day", () => {
    expect(daysBetween("2026-01-01", "2026-01-01")).toBe(0);
  });

  test("returns 0 when second date is before first (clamped)", () => {
    expect(daysBetween("2026-01-10", "2026-01-05")).toBe(0);
  });

  test("accepts Date objects", () => {
    expect(daysBetween(new Date("2026-01-01"), new Date("2026-01-08"))).toBe(7);
  });

  test("handles partial days (rounds)", () => {
    // 1.5 days → 2 (rounds)
    expect(daysBetween(new Date("2026-01-01T00:00:00"), new Date("2026-01-02T12:00:00"))).toBe(2);
  });
});

/* ------------------------------------------------------------------ */
/* truncate                                                            */
/* ------------------------------------------------------------------ */
describe("truncate", () => {
  test("returns empty string for empty input", () => {
    expect(truncate("")).toBe("");
  });

  test("returns full string if under limit", () => {
    expect(truncate("short", 120)).toBe("short");
  });

  test("truncates and adds ellipsis when over limit", () => {
    const long = "a".repeat(150);
    const result = truncate(long, 120);
    expect(result.length).toBeLessThan(150);
    expect(result).toMatch(/…$/);
  });

  test("respects custom length", () => {
    expect(truncate("hello world", 5)).toBe("hell…");
  });
});
