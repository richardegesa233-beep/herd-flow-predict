export interface HerdData {
  year: number;
  adults: number;
  young: number;
  males: number;
  females: number;
  total: number;
  births: number;
  femaleBirths: number;
  maleBirths: number;
  deaths: number;
  culled: number;
  malesSold: number;
  projectedTotal?: number;
  actualTotal?: number;
}

export interface ActualRecord {
  year: number;
  births: number;
  deaths: number;
  sales: number;
}

// Calculate Mean Absolute Error
export function calculateMAE(projections: HerdData[]): number | null {
  const pairs = projections.filter(p => p.actualTotal !== undefined && p.projectedTotal !== undefined);
  if (pairs.length === 0) return null;
  const sum = pairs.reduce((acc, p) => acc + Math.abs(p.projectedTotal! - p.actualTotal!), 0);
  return sum / pairs.length;
}

// Calculate Mean Absolute Percentage Error
export function calculateMAPE(projections: HerdData[]): number | null {
  const pairs = projections.filter(p => p.actualTotal !== undefined && p.actualTotal! > 0);
  if (pairs.length === 0) return null;
  const sum = pairs.reduce((acc, p) => acc + Math.abs(p.projectedTotal! - p.actualTotal!) / p.actualTotal!, 0);
  return (sum / pairs.length) * 100;
}

// Calculate Root Mean Square Error
export function calculateRMSE(projections: HerdData[]): number | null {
  const pairs = projections.filter(p => p.actualTotal !== undefined && p.projectedTotal !== undefined);
  if (pairs.length === 0) return null;
  const sumSq = pairs.reduce((acc, p) => acc + Math.pow(p.projectedTotal! - p.actualTotal!, 2), 0);
  return Math.sqrt(sumSq / pairs.length);
}

// Calculate Bias (positive = over-projecting, negative = under-projecting)
export function calculateBias(projections: HerdData[]): number | null {
  const pairs = projections.filter(p => p.actualTotal !== undefined && p.projectedTotal !== undefined);
  if (pairs.length === 0) return null;
  const sum = pairs.reduce((acc, p) => acc + (p.projectedTotal! - p.actualTotal!), 0);
  return sum / pairs.length;
}

// Fibonacci-inspired growth model for cattle
// Adults produce calves, young mature after 2 years
// Mortality rate applied annually
export function calculateHerdProjection(
  initialAdults: number,
  initialYoung: number,
  years: number,
  birthRate: number = 0.85, // 85% of adults produce calves
  mortalityRate: number = 0.05, // 5% annual mortality
  maturationYears: number = 2,
  cullRate: number = 0.10, // 10% annual cull/sales rate on adults
  femaleBirthRatio: number = 0.50 // 50% of births are female
): HerdData[] {
  const projections: HerdData[] = [];
  
  // Track female young by age for maturation (only females become breeding adults)
  let femaleYoungByAge: number[] = new Array(maturationYears).fill(0);
  // Track male young by age (sold when mature)
  let maleYoungByAge: number[] = new Array(maturationYears).fill(0);
  
  // Assume initial young split 50/50
  femaleYoungByAge[0] = Math.round(initialYoung * femaleBirthRatio);
  maleYoungByAge[0] = initialYoung - femaleYoungByAge[0];
  
  let adults = initialAdults; // breeding females
  let totalFemaleYoung = femaleYoungByAge.reduce((s, c) => s + c, 0);
  let totalMaleYoung = maleYoungByAge.reduce((s, c) => s + c, 0);
  let totalYoung = totalFemaleYoung + totalMaleYoung;
  
  for (let year = 0; year <= years; year++) {
    const totalMales = totalMaleYoung;
    const totalFemales = adults + totalFemaleYoung;
    const total = totalFemales + totalMales;
    
    // Calculate births (only adult females can give birth)
    const births = year === 0 ? 0 : Math.round(adults * birthRate);
    const femaleBirths = year === 0 ? 0 : Math.round(births * femaleBirthRatio);
    const maleBirths = year === 0 ? 0 : births - femaleBirths;
    
    // Calculate deaths (from total herd)
    const deaths = year === 0 ? 0 : Math.round(total * mortalityRate);
    
    // Calculate culled/sold (from adults only)
    const culled = year === 0 ? 0 : Math.round(adults * cullRate);
    
    // Males sold when they mature
    const malesSold = year === 0 ? 0 : (maleYoungByAge[maturationYears - 1] || 0);
    
    projections.push({
      year,
      adults: Math.round(adults),
      young: Math.round(totalYoung),
      males: Math.round(totalMales),
      females: Math.round(totalFemales),
      total: Math.round(total),
      births,
      femaleBirths,
      maleBirths,
      deaths,
      culled,
      malesSold,
      projectedTotal: Math.round(total),
    });
    
    if (year < years) {
      // Mature female young → become breeding adults
      const femaleMaturing = femaleYoungByAge[maturationYears - 1] || 0;
      
      // Apply mortality to adults, then subtract sales/cull
      const adultDeaths = Math.round(adults * mortalityRate);
      const sold = Math.round(adults * cullRate);
      adults = adults + femaleMaturing - adultDeaths - sold;
      
      // Shift female young ages and apply mortality
      for (let i = maturationYears - 1; i > 0; i--) {
        const youngDeaths = Math.round(femaleYoungByAge[i - 1] * mortalityRate);
        femaleYoungByAge[i] = femaleYoungByAge[i - 1] - youngDeaths;
      }
      
      // Shift male young ages and apply mortality (males sold at maturation)
      for (let i = maturationYears - 1; i > 0; i--) {
        const youngDeaths = Math.round(maleYoungByAge[i - 1] * mortalityRate);
        maleYoungByAge[i] = maleYoungByAge[i - 1] - youngDeaths;
      }
      
      // New births
      const newBirths = Math.round(adults * birthRate);
      const newFemaleBirths = Math.round(newBirths * femaleBirthRatio);
      femaleYoungByAge[0] = newFemaleBirths;
      maleYoungByAge[0] = newBirths - newFemaleBirths;
      
      // Calculate totals
      totalFemaleYoung = femaleYoungByAge.reduce((sum, count) => sum + count, 0);
      totalMaleYoung = maleYoungByAge.reduce((sum, count) => sum + count, 0);
      totalYoung = totalFemaleYoung + totalMaleYoung;
    }
  }
  
  return projections;
}

export function calculateWithActuals(
  projections: HerdData[],
  actuals: ActualRecord[]
): HerdData[] {
  let runningTotal = projections[0]?.total || 0;
  
  return projections.map((projection, index) => {
    const actual = actuals.find(a => a.year === projection.year);
    
    if (actual && index > 0) {
      runningTotal = runningTotal + actual.births - actual.deaths - actual.sales;
    }
    
    return {
      ...projection,
      actualTotal: actual ? runningTotal : undefined,
    };
  });
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(Math.round(num));
}
