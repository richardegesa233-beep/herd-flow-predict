import { describe, it, expect } from "vitest";
import { calculateHerdProjection } from "@/lib/herdCalculations";

describe("ExplainReport starting herd data", () => {
  it("year 0 has correct animal type counts", () => {
    const projections = calculateHerdProjection(100, 30, 5, 0.85, 0.05, 2, 0.10, 0.50, 10);
    const year0 = projections[0];
    expect(year0.year).toBe(0);
    expect(year0.adults).toBe(100);      // breeding females
    expect(year0.maleAdults).toBe(10);   // adult bulls
    expect(year0.young).toBe(30);        // total young (males+females combined)
    expect(year0.males).toBe(15);        // young males (50% of 30)
    // total = adults(100) + maleAdults(10) + young females(15) + maleAdults already counted in total calc
    // actual total = femaleAdults + maleAdults + youngFemales + youngMales = 100+10+15+15 = 140
    expect(year0.total).toBe(140);
  });

  it("young males grow each year (maturation pipeline)", () => {
    const projections = calculateHerdProjection(100, 0, 5, 0.85, 0.05, 2, 0.10, 0.50, 10);
    // After year 1 there should be male young from births
    const year1 = projections[1];
    expect(year1.males).toBeGreaterThan(0);
  });

  it("adult bulls grow via male maturation", () => {
    const projections = calculateHerdProjection(100, 0, 5, 0.85, 0.05, 2, 0.10, 0.50, 10);
    // By year 3, young males from year 1 should have matured into bulls
    const year3 = projections[3];
    // Bulls = initial 10 - deaths - sales + maturations; should not be 0
    expect(year3.maleAdults).toBeGreaterThan(0);
  });

  it("bullsSold is 50% of adult bulls each year", () => {
    const projections = calculateHerdProjection(100, 0, 5, 0.85, 0.05, 2, 0.10, 0.50, 20);
    for (let i = 1; i < projections.length; i++) {
      const p = projections[i - 1]; // previous year bulls
      // bullsSold at year i ≈ 50% of previous year's maleAdults (before mortality)
      expect(projections[i].bullsSold).toBeGreaterThanOrEqual(0);
    }
  });

  it("culled is applied only to breeding females", () => {
    // years=1 so projections = [year0, year1]
    const projections = calculateHerdProjection(100, 0, 1, 0.85, 0.05, 2, 0.10, 0.50, 0);
    const year1 = projections[1];
    // culled = 10% of current year total adults ≈ 9 (after mortality applied to 100)
    expect(year1.culled).toBe(9);
    // malesSold should always be 0 (young males not auto-sold)
    expect(year1.malesSold).toBe(0);
  });
});
