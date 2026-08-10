import { calculateDaySP, calculateStreakBonusSP } from '../spCalculator';
import type { Entry } from '@/db/types';

function entry(sugarG: number): Entry {
  return {
    id: 'x',
    date: '2026-08-10',
    timestamp: '2026-08-10T08:00:00.000Z',
    foodName: 'test',
    quantityDescription: null,
    sugarG,
    sugarGSource: 'user_entered',
    source: 'smart_log',
    redeemedTreat: null,
  };
}

describe('calculateDaySP', () => {
  const limit = 40;

  it('returns 0 for a day with no entries', () => {
    expect(calculateDaySP([], limit)).toBe(0);
  });

  it('gives the base 5pt + 15pt comfortably-under bonus when total < 75% of limit', () => {
    // total 20g < 30g (75% of 40)
    expect(calculateDaySP([entry(12), entry(8)], limit)).toBe(20);
  });

  it('adds the granular-tracking +5 once 3+ entries are logged', () => {
    expect(calculateDaySP([entry(10), entry(8), entry(2)], limit)).toBe(25);
  });

  it('gives the smaller 10pt just-under bonus when 75% <= total < limit', () => {
    // total 35g is between 30g and 40g
    expect(calculateDaySP([entry(35)], limit)).toBe(15);
  });

  it('gives only the base 5pt when the day is at or over the limit', () => {
    expect(calculateDaySP([entry(45)], limit)).toBe(5);
  });

  it('still applies the granular-tracking bonus even when over limit', () => {
    expect(calculateDaySP([entry(20), entry(15), entry(15)], limit)).toBe(10);
  });
});

describe('calculateStreakBonusSP', () => {
  it.each([
    [3, 10],
    [7, 25],
    [14, 40],
    [30, 75],
  ])('gives %ip a %ipt bonus at the milestone', (streak, bonus) => {
    expect(calculateStreakBonusSP(streak)).toBe(bonus);
  });

  it('gives no bonus on a non-milestone day', () => {
    expect(calculateStreakBonusSP(5)).toBe(0);
    expect(calculateStreakBonusSP(0)).toBe(0);
  });
});
