export interface HerdData {
  year: number;
  adults: number;
  young: number;
  total: number;
  births: number;
  deaths: number;
  projectedTotal?: number;
  actualTotal?: number;
}

export interface ActualRecord {
  year: number;
  births: number;
  deaths: number;
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
  maturationYears: number = 2
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
    
    projections.push({
      year,
      adults: Math.round(adults),
      young: Math.round(totalYoung),
      total: Math.round(total),
      births,
      deaths,
      projectedTotal: Math.round(total),
    });
    
    if (year < years) {
      // Mature young cattle (oldest age group becomes adults)
      const maturing = youngByAge[maturationYears - 1] || 0;
      adults = adults + maturing - Math.round(adults * mortalityRate * 0.3);
      
      // Shift ages
      for (let i = maturationYears - 1; i > 0; i--) {
        youngByAge[i] = youngByAge[i - 1] * (1 - mortalityRate * 0.7);
      }
      
      // New births become youngest
      youngByAge[0] = births;
      
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
      runningTotal = runningTotal + actual.births - actual.deaths;
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
