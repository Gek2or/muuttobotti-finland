import test from "node:test";
import assert from "node:assert/strict";
import {
  addBookingDays, availableStartTimes, helsinkiNow,
  isBookableStart, validBookingDate, workingHoursForDate,
} from "../app/booking-window.ts";

test("validates real calendar dates and 180-day horizon", () => {
  assert.equal(validBookingDate("2026-02-30"), false);
  assert.equal(validBookingDate("2028-02-29"), true);
  assert.equal(addBookingDays("2026-10-26", 180), "2027-04-24");
  const now = new Date("2026-10-26T06:15:00Z"); // 08:15 in Helsinki
  assert.equal(isBookableStart("2027-04-24", "08:00", now), true);
  assert.equal(isBookableStart("2027-04-25", "12:00", now), false);
  assert.equal(isBookableStart("2026-10-25", "12:00", now), false);
});

test("uses Finland clock, not browser or server timezone", () => {
  const now = new Date("2026-10-26T06:15:00Z");
  assert.deepEqual(helsinkiNow(now), { date: "2026-10-26", minutes: 495 });
  assert.equal(isBookableStart("2026-10-26", "08:00", now), false);
  assert.equal(isBookableStart("2026-10-26", "08:30", now), true);
  assert.equal(isBookableStart("2026-10-26", "08:15", now), false);
  assert.equal(isBookableStart("2026-10-26", "22:00", now), true);
  assert.equal(isBookableStart("2026-10-26", "22:30", now), false);
});

test("honors published Saturday and Sunday opening hours", () => {
  const now = new Date("2026-10-26T06:15:00Z");
  assert.deepEqual(workingHoursForDate("2026-11-01"), { open: 720, close: 1080 });
  assert.equal(isBookableStart("2026-10-31", "22:30", now), true);
  assert.equal(isBookableStart("2026-10-31", "23:00", now), false);
  assert.equal(isBookableStart("2026-11-01", "11:30", now), false);
  assert.equal(isBookableStart("2026-11-01", "12:00", now), true);
  assert.equal(isBookableStart("2026-11-01", "17:30", now), true);
  assert.equal(isBookableStart("2026-11-01", "18:00", now), false);
  assert.equal(availableStartTimes("2026-11-01", now).length, 12);
});

test("handles both daylight saving transitions", () => {
  assert.deepEqual(helsinkiNow(new Date("2026-03-29T00:30:00Z")), { date: "2026-03-29", minutes: 150 });
  assert.deepEqual(helsinkiNow(new Date("2026-03-29T01:30:00Z")), { date: "2026-03-29", minutes: 270 });
  assert.deepEqual(helsinkiNow(new Date("2026-10-25T00:30:00Z")), { date: "2026-10-25", minutes: 210 });
  assert.deepEqual(helsinkiNow(new Date("2026-10-25T01:30:00Z")), { date: "2026-10-25", minutes: 210 });
});

test("blocks already-passed same-day slots", () => {
  const now = new Date("2026-10-26T19:59:00Z"); // 21:59 Helsinki
  assert.equal(isBookableStart("2026-10-26", "21:30", now), false);
  assert.equal(isBookableStart("2026-10-26", "22:00", now), true);
  assert.deepEqual(availableStartTimes("2026-10-26", now), ["22:00"]);
});
