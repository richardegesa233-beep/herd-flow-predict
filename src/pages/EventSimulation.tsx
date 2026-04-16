import { Layout } from "@/components/Layout";
import { useState, useMemo, useCallback } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { ActualRecord } from "@/lib/herdCalculations";
import {
  SimulationConfig, SimulatedYear, SimulationSummary, DEFAULT_SIM_CONFIG,
  runStochasticSimulation, runMonteCarloSimulation,
} from "@/lib/stochasticSimulation";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dices, Play, RefreshCw, Zap, TrendingUp, TrendingDown,
  Shield, BarChart3, Activity, Sparkles, AlertTriangle, Target, Layers,
} from "lucide-react";
import { toast } from "sonner";
import { formatNumber } from "@/lib/herdCalculations";
import { ExplainSimulation } from "@/components/ExplainSimulation";

type HerdConfig = {
  femaleAdults: number;
  maleAdults: number;
  young: number;
  years: number;
  birthRate: number;
  mortalityRate: number;
  cullRate: number;
};

const DEFAULT_HERD: HerdConfig = {
  femaleAdults: 60, maleAdults: 4, young: 25, years: 8,
  birthRate: 0.85, mortalityRate: 0.05, cullRate: 0.10,
};

const EventSimulation = () => {
  const [herdConfig] = useLocalStorage<HerdConfig>("herd-config", DEFAULT_HERD);
  const [, setEventRecords] = useLocalStorage<ActualRecord[]>("event-records", []);

  // Persist stochastic parameters across tab switches
  const [birthVol, setBirthVol] = useLocalStorage("sim-birthVol", DEFAULT_SIM_CONFIG.birthRateVolatility);
  const [mortVol, setMortVol] = useLocalStorage("sim-mortVol", DEFAULT_SIM_CONFIG.mortalityVolatility);
  const [cullVol, setCullVol] = useLocalStorage("sim-cullVol", DEFAULT_SIM_CONFIG.cullVolatility);
  const [droughtProb, setDroughtProb] = useLocalStorage("sim-droughtProb", DEFAULT_SIM_CONFIG.droughtProbability);
  const [diseaseProb, setDiseaseProb] = useLocalStorage("sim-diseaseProb", DEFAULT_SIM_CONFIG.diseaseProbability);
  const [monteCarloRuns, setMonteCarloRuns] = useLocalStorage("sim-mcRuns", 100);

  // Persist simulation results across tab switches
  const [simResult, setSimResult] = useLocalStorage<{ years: SimulatedYear[]; records: ActualRecord[] } | null>("sim-result", null);
  const [mcSummary, setMcSummary] = useLocalStorage<SimulationSummary | null>("sim-mcSummary", null);
  const [isRunning, setIsRunning] = useState(false);

  const buildConfig = useCallback((): SimulationConfig => ({
    initialFemaleAdults: herdConfig.femaleAdults,
    initialMaleAdults: herdConfig.maleAdults,
    initialYoung: herdConfig.young,
    years: herdConfig.years,
    birthRate: herdConfig.birthRate,
    mortalityRate: herdConfig.mortalityRate,
    cullRate: herdConfig.cullRate,
    birthRateVolatility: birthVol,
    mortalityVolatility: mortVol,
    cullVolatility: cullVol,
    droughtProbability: droughtProb,
    diseaseProbability: diseaseProb,
  }), [herdConfig, birthVol, mortVol, cullVol, droughtProb, diseaseProb]);

  const runSingle = () => {
    const config = buildConfig();
    const result = runStochasticSimulation(config);
    setSimResult(result);
    setEventRecords(result.records);
    toast.success("Simulation complete — event records updated for Comparison Report");
  };

  const runMonteCarlo = () => {
    setIsRunning(true);
    setTimeout(() => {
      const config = buildConfig();
      const summary = runMonteCarloSimulation(config, monteCarloRuns);
      setMcSummary(summary);
      const medianRun = summary.runs[Math.floor(summary.runs.length / 2)];
      if (medianRun) {
        setSimResult({ years: medianRun.years, records: medianRun.records });
        setEventRecords(medianRun.records);
      }
      setIsRunning(false);
      toast.success(`Monte Carlo complete — ${monteCarloRuns} simulations averaged`);
    }, 50);
  };

  const resetSimulation = () => {
    setBirthVol(DEFAULT_SIM_CONFIG.birthRateVolatility);
    setMortVol(DEFAULT_SIM_CONFIG.mortalityVolatility);
    setCullVol(DEFAULT_SIM_CONFIG.cullVolatility);
    setDroughtProb(DEFAULT_SIM_CONFIG.droughtProbability);
    setDiseaseProb(DEFAULT_SIM_CONFIG.diseaseProbability);
    setMonteCarloRuns(100);
    setSimResult(null);
    setMcSummary(null);
    setEventRecords([]);
    toast.info("Simulation reset to defaults");
  };

  const totalHerd = herdConfig.femaleAdults + herdConfig.maleAdults + herdConfig.young;

  const eventCounts = useMemo(() => {
    if (!simResult) return { droughts: 0, diseases: 0, good: 0 };
    let droughts = 0, diseases = 0, good = 0;
    simResult.years.forEach(y => {
      y.events.forEach(e => {
        if (e.includes("Drought")) droughts++;
        if (e.includes("Disease")) diseases++;
        if (e.includes("Pasture") || e.includes("Vet")) good++;
      });
    });
    return { droughts, diseases, good };
  }, [simResult]);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Header */}
        <div className="animate-slide-up">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-1">Probabilistic Engine</p>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3" style={{ fontFamily: "'Playfair Display', serif" }}>
            <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/15">
              <Dices className="h-5 w-5 text-accent" />
            </div>
            Event Simulation
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Stochastic simulation using your Herd Projection parameters •
            <span className="text-foreground font-medium"> {formatNumber(totalHerd)} head</span> starting herd
          </p>
        </div>

        {/* Source params banner */}
        <div className="bg-card border border-border/50 rounded-2xl p-4 shadow-card animate-slide-up stagger-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-2.5 flex items-center gap-1.5">
            <Target className="h-3 w-3" /> Inherited from Herd Projection
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {[
              { label: "♀ Adults", value: herdConfig.femaleAdults },
              { label: "♂ Bulls", value: herdConfig.maleAdults },
              { label: "Young", value: herdConfig.young },
              { label: "Years", value: herdConfig.years },
              { label: "Birth %", value: `${(herdConfig.birthRate * 100).toFixed(0)}%` },
              { label: "Mortality", value: `${(herdConfig.mortalityRate * 100).toFixed(0)}%` },
            ].map(p => (
              <div key={p.label} className="text-center">
                <p className="text-lg font-bold tabular-nums text-foreground">{p.value}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{p.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stochastic controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-5 animate-slide-in-left">
            <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-card space-y-5">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground flex items-center gap-2">
                <Zap className="h-3.5 w-3.5" /> Volatility Controls
              </h2>

              <SliderControl label="Birth Rate Volatility" value={birthVol} onChange={setBirthVol}
                min={0} max={0.30} step={0.01} format={v => `±${(v * 100).toFixed(0)}%`}
                description="Randomness around birth rate" />

              <SliderControl label="Mortality Volatility" value={mortVol} onChange={setMortVol}
                min={0} max={0.40} step={0.01} format={v => `±${(v * 100).toFixed(0)}%`}
                description="Randomness around death rate" />

              <SliderControl label="Cull Volatility" value={cullVol} onChange={setCullVol}
                min={0} max={0.30} step={0.01} format={v => `±${(v * 100).toFixed(0)}%`}
                description="Randomness around cull/sales rate" />
            </div>

            <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-card space-y-5">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5" /> Environmental Shocks
              </h2>

              <SliderControl label="Drought Probability" value={droughtProb} onChange={setDroughtProb}
                min={0} max={0.30} step={0.01} format={v => `${(v * 100).toFixed(0)}%/yr`}
                description="Annual chance of drought event" />

              <SliderControl label="Disease Probability" value={diseaseProb} onChange={setDiseaseProb}
                min={0} max={0.25} step={0.01} format={v => `${(v * 100).toFixed(0)}%/yr`}
                description="Annual chance of disease outbreak" />
            </div>

            <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-card space-y-4">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground flex items-center gap-2">
                <Layers className="h-3.5 w-3.5" /> Monte Carlo
              </h2>
              <SliderControl label="Simulation Runs" value={monteCarloRuns} onChange={v => setMonteCarloRuns(Math.round(v))}
                min={10} max={500} step={10} format={v => `${Math.round(v)}`}
                description="Number of parallel simulations" />
            </div>

            <div className="flex gap-2">
              <Button onClick={runSingle} className="flex-1 gap-2 rounded-xl">
                <Play className="h-4 w-4" /> Single Run
              </Button>
              <Button onClick={runMonteCarlo} variant="outline" className="flex-1 gap-2 rounded-xl" disabled={isRunning}>
                {isRunning ? <RefreshCw className="h-4 w-4 animate-spin" /> : <BarChart3 className="h-4 w-4" />}
                Monte Carlo
              </Button>
            </div>
            <Button onClick={resetSimulation} variant="ghost" className="w-full gap-2 rounded-xl text-muted-foreground hover:text-destructive">
              <RefreshCw className="h-3.5 w-3.5" /> Reset All
            </Button>
          </div>

          {/* Results */}
          <div className="lg:col-span-2 space-y-6">
            {simResult ? (
              <>
                {/* Explain button */}
                <div className="flex justify-end animate-slide-up">
                  <ExplainSimulation
                    years={simResult.years}
                    mcSummary={mcSummary}
                    config={{ birthVol, mortVol, cullVol, droughtProb, diseaseProb, monteCarloRuns }}
                    startingHerd={totalHerd}
                  />
                </div>

                {/* Summary cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-slide-up stagger-1">
                  {[
                    { label: "Final Herd", value: formatNumber(simResult.years[simResult.years.length - 1]?.herdEnd ?? 0), icon: Target, color: "text-primary" },
                    { label: "Growth", value: `${(((simResult.years[simResult.years.length - 1]?.herdEnd ?? totalHerd) - totalHerd) / totalHerd * 100).toFixed(1)}%`, icon: TrendingUp, color: "text-accent" },
                    { label: "Shocks", value: `${eventCounts.droughts + eventCounts.diseases}`, icon: AlertTriangle, color: "text-destructive" },
                    { label: "Positive", value: `${eventCounts.good}`, icon: Sparkles, color: "text-primary" },
                  ].map(s => (
                    <div key={s.label} className="bg-card border border-border/50 rounded-xl px-4 py-3 text-center shadow-xs hover-lift transition-all">
                      <s.icon className={`h-4 w-4 mx-auto mb-1.5 ${s.color}`} />
                      <p className={`text-lg font-bold tabular-nums ${s.color}`}>{s.value}</p>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Monte Carlo summary */}
                {mcSummary && (
                  <div className="bg-card border border-primary/20 rounded-2xl p-5 shadow-card animate-slide-up stagger-2">
                    <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-primary mb-3 flex items-center gap-2">
                      <BarChart3 className="h-3.5 w-3.5" /> Monte Carlo Distribution ({monteCarloRuns} runs)
                    </h3>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                      {[
                        { label: "Mean", value: formatNumber(mcSummary.meanFinalHerd) },
                        { label: "Std Dev", value: `±${formatNumber(mcSummary.stdFinalHerd)}` },
                        { label: "Min", value: formatNumber(mcSummary.minFinalHerd) },
                        { label: "Max", value: formatNumber(mcSummary.maxFinalHerd) },
                        { label: "P5", value: formatNumber(mcSummary.p5FinalHerd) },
                        { label: "P95", value: formatNumber(mcSummary.p95FinalHerd) },
                      ].map(s => (
                        <div key={s.label} className="text-center">
                          <p className="text-base font-bold tabular-nums text-foreground">{s.value}</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Year-by-year table */}
                <div className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-card animate-slide-up stagger-3">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40">
                        <TableHead className="text-xs w-14">Year</TableHead>
                        <TableHead className="text-xs">Start</TableHead>
                        <TableHead className="text-xs">Births</TableHead>
                        <TableHead className="text-xs">Deaths</TableHead>
                        <TableHead className="text-xs">Sales</TableHead>
                        <TableHead className="text-xs">End</TableHead>
                        <TableHead className="text-xs">Events</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {simResult.years.map(yr => {
                        const net = yr.births - yr.deaths - yr.sales;
                        return (
                          <TableRow key={yr.year}>
                            <TableCell className="font-mono text-xs font-semibold">{yr.year}</TableCell>
                            <TableCell className="tabular-nums">{formatNumber(yr.herdStart)}</TableCell>
                            <TableCell className="text-primary font-medium tabular-nums">+{yr.births}</TableCell>
                            <TableCell className="text-destructive font-medium tabular-nums">−{yr.deaths}</TableCell>
                            <TableCell className="text-accent font-medium tabular-nums">↗{yr.sales}</TableCell>
                            <TableCell className={`font-bold tabular-nums ${net >= 0 ? 'text-primary' : 'text-destructive'}`}>
                              {formatNumber(yr.herdEnd)}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {yr.events.map((e, i) => (
                                  <Badge key={i} variant="secondary" className="text-[10px] py-0 px-1.5 font-normal">
                                    {e}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </>
            ) : (
              <Card className="shadow-card border-border/50">
                <CardContent className="flex flex-col items-center justify-center py-24 text-center space-y-4">
                  <div className="h-16 w-16 rounded-2xl bg-muted/60 flex items-center justify-center mb-2">
                    <Dices className="h-8 w-8 text-muted-foreground/40" />
                  </div>
                  <h3 className="text-xl font-semibold text-muted-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Ready to Simulate
                  </h3>
                  <p className="text-sm text-muted-foreground/70 max-w-md leading-relaxed">
                    Adjust volatility and shock parameters, then run a <strong className="text-foreground">Single Run</strong> for
                    one stochastic path or <strong className="text-foreground">Monte Carlo</strong> for statistical distribution.
                  </p>
                  <div className="bg-muted/30 border border-dashed border-border/60 rounded-xl p-4 max-w-sm text-left text-xs text-muted-foreground space-y-2">
                    <p className="font-semibold text-foreground text-[11px] flex items-center gap-1"><Activity className="h-3 w-3" /> How it works</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Reads your <span className="text-primary font-medium">Herd Projection</span> params automatically</li>
                      <li>Applies <span className="text-foreground font-medium">probabilistic perturbations</span> each year</li>
                      <li>Random <span className="text-destructive font-medium">shocks</span> (drought, disease) can occur</li>
                      <li>Results auto-sync to <span className="text-accent font-medium">Comparison Report</span></li>
                    </ol>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

// Reusable slider control
function SliderControl({ label, value, onChange, min, max, step, format, description }: {
  label: string; value: number; onChange: (v: number) => void;
  min: number; max: number; step: number; format: (v: number) => string; description: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium text-foreground">{label}</Label>
        <span className="text-xs font-bold tabular-nums text-primary bg-primary/10 px-2 py-0.5 rounded-full">
          {format(value)}
        </span>
      </div>
      <Slider value={[value]} onValueChange={([v]) => onChange(v)} min={min} max={max} step={step} className="w-full" />
      <p className="text-[10px] text-muted-foreground">{description}</p>
    </div>
  );
}

export default EventSimulation;
