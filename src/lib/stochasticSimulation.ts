import { ActualRecord } from "./herdCalculations";

// Box-Muller transform for normal distribution
function randomNormal(mean: number, stdDev: number): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + z * stdDev;
}

// Clamp to non-negative integer
function clampInt(val: number): number {
  return Math.max(0, Math.round(val));
}

// Binomial approximation using normal distribution for large n
function randomBinomial(n: number, p: number): number {
  if (n <= 0) return 0;
  if (n < 20) {
    // Direct simulation for small n
    let successes = 0;
    for (let i = 0; i < n; i++) {
      if (Math.random() < p) successes++;
    }
    return successes;
  }
  // Normal approximation
  const mean = n * p;
  const std = Math.sqrt(n * p * (1 - p));
  return clampInt(randomNormal(mean, std));
}

export interface SimulationConfig {
  initialFemaleAdults: number;
  initialMaleAdults: number;
  initialYoung: number;
  years: number;
  birthRate: number;
  mortalityRate: number;
  cullRate: number;
  // Stochastic parameters (standard deviations as fraction of rate)
  birthRateVolatility: number;     // e.g. 0.10 means ±10% of birthRate
  mortalityVolatility: number;     // e.g. 0.15
  cullVolatility: number;          // e.g. 0.10
  // Environmental shock probability per year
  droughtProbability: number;      // e.g. 0.08 (8% chance per year)
  diseaseProbability: number;      // e.g. 0.05
}

export interface SimulatedYear {
  year: number;
  herdStart: number;
  births: number;
  deaths: number;
  sales: number;
  herdEnd: number;
  effectiveBirthRate: number;
  effectiveMortalityRate: number;
  effectiveCullRate: number;
  events: string[];
}

export interface SimulationResult {
  years: SimulatedYear[];
  records: ActualRecord[];
  seed: number;
}

export const DEFAULT_SIM_CONFIG: Omit<SimulationConfig, 'initialFemaleAdults' | 'initialMaleAdults' | 'initialYoung' | 'years' | 'birthRate' | 'mortalityRate' | 'cullRate'> = {
  birthRateVolatility: 0.08,
  mortalityVolatility: 0.12,
  cullVolatility: 0.08,
  droughtProbability: 0.12,
  diseaseProbability: 0.06,
};

export function runStochasticSimulation(config: SimulationConfig): SimulationResult {
  const seed = Date.now();
  const years: SimulatedYear[] = [];
  const records: ActualRecord[] = [];

  let herd = config.initialFemaleAdults + config.initialMaleAdults + config.initialYoung;

  for (let yr = 1; yr <= config.years; yr++) {
    const herdStart = herd;
    const events: string[] = [];

    // Stochastic rate perturbation
    let effectiveBirthRate = Math.max(0, Math.min(1,
      randomNormal(config.birthRate, config.birthRate * config.birthRateVolatility)
    ));
    let effectiveMortalityRate = Math.max(0, Math.min(0.5,
      randomNormal(config.mortalityRate, config.mortalityRate * config.mortalityVolatility)
    ));
    let effectiveCullRate = Math.max(0, Math.min(0.5,
      randomNormal(config.cullRate, config.cullRate * config.cullVolatility)
    ));

    // Environmental shocks
    if (Math.random() < config.droughtProbability) {
      events.push("🌵 Drought");
      effectiveBirthRate *= 0.70;          // 30% fewer births
      effectiveMortalityRate *= 1.40;      // 40% more deaths
    }

    if (Math.random() < config.diseaseProbability) {
      events.push("🦠 Disease Outbreak");
      effectiveMortalityRate *= 1.80;      // 80% more deaths
      effectiveBirthRate *= 0.85;
    }

    // Occasional positive event
    if (Math.random() < 0.06) {
      events.push("🌿 Excellent Pasture");
      effectiveBirthRate *= 1.15;
      effectiveMortalityRate *= 0.80;
    }

    if (Math.random() < 0.04) {
      events.push("🏥 Vet Campaign");
      effectiveMortalityRate *= 0.60;
    }

    // Calculate events using binomial draws
    const breedingFemales = Math.round(herdStart * (config.initialFemaleAdults / (config.initialFemaleAdults + config.initialMaleAdults + config.initialYoung)));
    const births = randomBinomial(Math.max(1, breedingFemales), effectiveBirthRate);
    const deaths = randomBinomial(herdStart, effectiveMortalityRate);
    const sales = randomBinomial(Math.max(0, herdStart - deaths), effectiveCullRate);

    herd = Math.max(1, herdStart + births - deaths - sales);

    if (events.length === 0) events.push("— Normal year");

    const simYear: SimulatedYear = {
      year: yr,
      herdStart,
      births,
      deaths,
      sales,
      herdEnd: herd,
      effectiveBirthRate,
      effectiveMortalityRate,
      effectiveCullRate,
      events,
    };

    years.push(simYear);
    records.push({ year: yr, births, deaths, sales });
  }

  return { years, records, seed };
}

// Run N simulations and return summary statistics
export interface SimulationSummary {
  meanFinalHerd: number;
  stdFinalHerd: number;
  minFinalHerd: number;
  maxFinalHerd: number;
  p5FinalHerd: number;
  p95FinalHerd: number;
  runs: SimulationResult[];
}

export function runMonteCarloSimulation(config: SimulationConfig, numRuns: number = 100): SimulationSummary {
  const runs: SimulationResult[] = [];
  const finals: number[] = [];

  for (let i = 0; i < numRuns; i++) {
    const result = runStochasticSimulation(config);
    runs.push(result);
    finals.push(result.years[result.years.length - 1]?.herdEnd ?? 0);
  }

  finals.sort((a, b) => a - b);

  const mean = finals.reduce((s, v) => s + v, 0) / finals.length;
  const variance = finals.reduce((s, v) => s + (v - mean) ** 2, 0) / finals.length;

  return {
    meanFinalHerd: Math.round(mean),
    stdFinalHerd: Math.round(Math.sqrt(variance)),
    minFinalHerd: finals[0],
    maxFinalHerd: finals[finals.length - 1],
    p5FinalHerd: finals[Math.floor(finals.length * 0.05)],
    p95FinalHerd: finals[Math.floor(finals.length * 0.95)],
    runs,
  };
}