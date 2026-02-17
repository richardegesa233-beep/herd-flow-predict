export interface HerdData {
  year: number;
  adults: number;
  young: number;
  total: number;
  births: number;
  deaths: number;
  culled: number;
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
  cullRate: number = 0.10 // 10% annual cull/sales rate on adults
): HerdData[] {
  const projections: HerdData[] = [];
  
  // Track young by age for maturation
  let youngByAge: number[] = new Array(maturationYears).fill(0);
  youngByAge[0] = initialYoung;
  
  let adults = initialAdults;
  let totalYoung = initialYoung;
  
  for (let year = 0; year <= years; year++) {
    const total = adults + totalYoung;
    
    // Calculate births (only adults can give birth)
    const births = year === 0 ? 0 : Math.round(adults * birthRate);
    
    // Calculate deaths (from total herd)
    const deaths = year === 0 ? 0 : Math.round(total * mortalityRate);
    
    // Calculate culled/sold (from adults only)
    const culled = year === 0 ? 0 : Math.round(adults * cullRate);
    
    projections.push({
      year,
      adults: Math.round(adults),
      young: Math.round(totalYoung),
      total: Math.round(total),
      births,
      deaths,
      culled,
      projectedTotal: Math.round(total),
    });
    
    if (year < years) {
      // Mature young cattle (oldest age group becomes adults)
      const maturing = youngByAge[maturationYears - 1] || 0;
      
      // Apply mortality uniformly to adults, then subtract sales/cull
      const adultDeaths = Math.round(adults * mortalityRate);
      const sold = Math.round(adults * cullRate);
      adults = adults + maturing - adultDeaths - sold;
      
      // Shift ages and apply mortality uniformly to young
      for (let i = maturationYears - 1; i > 0; i--) {
        const youngDeaths = Math.round(youngByAge[i - 1] * mortalityRate);
        youngByAge[i] = youngByAge[i - 1] - youngDeaths;
      }
      
      // New births become youngest
      youngByAge[0] = Math.round(adults * birthRate);
      
      // Calculate total young
      totalYoung = youngByAge.reduce((sum, count) => sum + count, 0);
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
