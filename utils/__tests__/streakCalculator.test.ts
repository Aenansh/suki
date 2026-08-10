import { computeNewStreak } from '../streakCalculator';

describe('computeNewStreak', () => {
  it('starts a streak at 1 on the very first logged day', () => {
    const result = computeNewStreak({
      currentStreak: 0,
      lastLoggedDate: null,
      today: '2026-08-10',
      todayHasEntries: true,
      graceDaysUsedThisWeek: 0,
    });
    expect(result).toEqual({ newStreak: 1, newGraceDaysUsed: 0 });
  });

  it('extends the streak by 1 on a consecutive logged day', () => {
    const result = computeNewStreak({
      currentStreak: 5,
      lastLoggedDate: '2026-08-09',
      today: '2026-08-10',
      todayHasEntries: true,
      graceDaysUsedThisWeek: 0,
    });
    expect(result).toEqual({ newStreak: 6, newGraceDaysUsed: 0 });
  });

  it('leaves the streak untouched on a day with no entries (over-limit or empty)', () => {
    const result = computeNewStreak({
      currentStreak: 5,
      lastLoggedDate: '2026-08-09',
      today: '2026-08-10',
      todayHasEntries: false,
      graceDaysUsedThisWeek: 0,
    });
    expect(result).toEqual({ newStreak: 5, newGraceDaysUsed: 0 });
  });

  it('uses the weekly grace day to bridge exactly one missed day', () => {
    const result = computeNewStreak({
      currentStreak: 5,
      lastLoggedDate: '2026-08-08', // 2026-08-09 was missed
      today: '2026-08-10',
      todayHasEntries: true,
      graceDaysUsedThisWeek: 0,
    });
    expect(result).toEqual({ newStreak: 6, newGraceDaysUsed: 1 });
  });

  it('resets the streak on one missed day if the grace day is already spent this week', () => {
    const result = computeNewStreak({
      currentStreak: 5,
      lastLoggedDate: '2026-08-08',
      today: '2026-08-10',
      todayHasEntries: true,
      graceDaysUsedThisWeek: 1,
    });
    expect(result).toEqual({ newStreak: 1, newGraceDaysUsed: 1 });
  });

  it('resets the streak when two or more days are missed, even with grace available', () => {
    const result = computeNewStreak({
      currentStreak: 5,
      lastLoggedDate: '2026-08-05',
      today: '2026-08-10',
      todayHasEntries: true,
      graceDaysUsedThisWeek: 0,
    });
    expect(result).toEqual({ newStreak: 1, newGraceDaysUsed: 0 });
  });
});
