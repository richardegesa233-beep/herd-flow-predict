import { Layout } from "@/components/Layout";
import { useMemo, useState } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { usePdfExport } from "@/hooks/usePdfExport";
import { ExplainReport } from "@/components/ExplainReport";
import { ProjectionChart } from "@/components/ProjectionChart";
import { VarianceTable } from "@/components/VarianceTable";
import {
  HerdData, ActualRecord, calculateHerdProjection, calculateWithActuals,
  calculateMAE, calculateMAPE, calculateRMSE, calculateBias,
} from "@/lib/herdCalculations";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  FileBarChart, Download, Loader2, Crosshair, Scale, Gauge,
  GitCompareArrows, Info, ClipboardList, ArrowRight, Sparkles,
} from "lucide-react";

const DEMO_PROJECTIONS = calculateHerdProjection(60, 25, 8, 0.85, 0.05, 2, 0.10, 0.50, 4);
const DEMO_ACTUALS: ActualRecord[] = [
  { year: 1, births: 48, deaths: 4, sales: 6 },
  { year: 2, births: 55, deaths: 5, sales: 8 },
  { year: 3, births: 52, deaths: 3, sales: 7 },
  { year: 4, births: 58, deaths: 6, sales: 5 },
  { year: 5, births: 50, deaths: 4, sales: 9 },
];

type ProjectionConfig = {
  adults: number; young: number; years: number;
  birthRate: number; mortalityRate: number; cullRate: number;
};

function MetricTile({ label, value, unit, hint, icon: Icon, tone }: {
  label: string; value: string; unit?: string; hint: string;
  icon: React.ElementType; tone: "good" | "warn" | "bad" | "neutral";
}) {
  const toneClasses = {
    good: "border-primary/20 bg-primary/[0.04]", warn: "border-accent/20 bg-accent/[0.04]",
    bad: "border-destructive/20 bg-destructive/[0.04]", neutral: "border-border bg-muted/30",
  };
  const valueTone = { good: "text-primary", warn: "text-accent", bad: "text-destructive", neutral: "text-foreground" };

  return (
    <div className={`rounded-2xl border p-5 ${toneClasses[tone]} transition-all duration-300 hover-lift shadow-xs`}>
      <div className="flex items-center gap-2 mb-2.5">
        <div className="p-1.5 rounded-lg bg-background/60 border border-border/30">
          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{label}</span>
      </div>
      <p className={`text-2xl font-bold tabular-nums ${valueTone[tone]}`} style={{ fontFamily: "'Playfair Display', serif" }}>
        {value}{unit && <span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span>}
      </p>
      <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">{hint}</p>
    </div>
  );
}

export default function ComparisonReport() {
  const [baseProjections] = useLocalStorage<HerdData[]>("herd-projections", []);
  const [config] = useLocalStorage<ProjectionConfig | null>("herd-config", null);
  const [eventRecords] = useLocalStorage<ActualRecord[]>("event-records", []);

  const [demoProjections, setDemoProjections] = useState<HerdData[] | null>(null);
  const [demoConfig, setDemoConfig] = useState<ProjectionConfig | null>(null);
  const [demoActuals, setDemoActuals] = useState<ActualRecord[] | null>(null);

  const isDemo = demoProjections !== null;
  const activeProjections = demoProjections ?? baseProjections;
  const activeConfig = demoConfig ?? config;
  const activeActuals = demoActuals ?? eventRecords;

  const loadDemo = () => {
    setDemoProjections(DEMO_PROJECTIONS);
    setDemoConfig({ adults: 60, young: 25, years: 8, birthRate: 0.85, mortalityRate: 0.05, cullRate: 0.10 });
    setDemoActuals(DEMO_ACTUALS);
    toast.success("Demo data loaded — explore the report!");
  };

  const exitDemo = () => {
    setDemoProjections(null);
    setDemoConfig(null);
    setDemoActuals(null);
    toast.success("Switched back to your real data.");
  };

  const { exportToPdf, isExporting } = usePdfExport();

  const projections = useMemo(() => {
    if (!activeProjections.length || !activeActuals.length) return activeProjections;
    return calculateWithActuals(activeProjections, activeActuals);
  }, [activeProjections, activeActuals]);

  const hasProjections = activeProjections.length > 0;
  const yearsWithActuals = projections.filter((p) => p.actualTotal !== undefined);

  const mae = useMemo(() => calculateMAE(projections), [projections]);
  const mape = useMemo(() => calculateMAPE(projections), [projections]);
  const rmse = useMemo(() => calculateRMSE(projections), [projections]);
  const bias = useMemo(() => calculateBias(projections), [projections]);
  const hasMetrics = [mae, mape, rmse, bias].some((m) => m !== null);

  const overallVariance = useMemo(() => {
    if (!yearsWithActuals.length) return null;
    const totalP = yearsWithActuals.reduce((s, p) => s + p.total, 0);
    const totalA = yearsWithActuals.reduce((s, p) => s + p.actualTotal!, 0);
    const pct = ((totalA - totalP) / totalP) * 100;
    return { pct, isPositive: totalA >= totalP, years: yearsWithActuals.length };
  }, [yearsWithActuals]);

  const handleExport = async () => {
    try {
      await exportToPdf("comparison-content", {
        filename: `variance-analysis-${new Date().toISOString().split("T")[0]}.pdf`,
        title: "Variance Analysis Report",
        subtitle: `Projected vs Actual • ${activeActuals.length} data points`,
      });
      toast.success("PDF saved!");
    } catch { toast.error("Export failed — try again."); }
  };

  return (
    <Layout>
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6" id="comparison-content">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 animate-slide-up">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center border border-primary/10 shadow-xs">
              <FileBarChart className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-0.5">Performance</p>
              <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>Variance Analysis</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasProjections && (
              <>
                {isDemo && (
                  <Button onClick={exitDemo} variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                    Exit Demo
                  </Button>
                )}
                <ExplainReport projections={projections} config={activeConfig} actuals={activeActuals} mode="comparison" />
                <Button onClick={handleExport} disabled={isExporting} variant="outline" size="sm" className="gap-1.5 rounded-xl">
                  {isExporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />} PDF
                </Button>
              </>
            )}
          </div>
        </div>

        {hasProjections ? (
          <>
            {/* Metrics */}
            {hasMetrics && (
              <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 animate-slide-up stagger-1">
                {mae !== null && <MetricTile label="MAE" value={mae.toFixed(1)} unit="head" hint="Average absolute deviation per year" icon={Crosshair} tone="neutral" />}
                {mape !== null && <MetricTile label="MAPE" value={mape.toFixed(1)} unit="%" hint={mape < 10 ? "Excellent accuracy" : mape < 25 ? "Moderate — review rates" : "High deviation — recalibrate"} icon={Gauge} tone={mape < 10 ? "good" : mape < 25 ? "warn" : "bad"} />}
                {rmse !== null && <MetricTile label="RMSE" value={rmse.toFixed(1)} unit="head" hint="Penalises large single-year misses" icon={Scale} tone="neutral" />}
                {bias !== null && <MetricTile label="Bias" value={`${bias > 0 ? "+" : ""}${bias.toFixed(1)}`} hint={bias > 5 ? "Model is over-projecting" : bias < -5 ? "Model is under-projecting" : "Well balanced"} icon={GitCompareArrows} tone={Math.abs(bias) > 5 ? "warn" : "good"} />}
              </section>
            )}

            {/* Overall variance banner */}
            {overallVariance && (
              <div className="flex items-center gap-3 bg-muted/30 rounded-2xl border border-border/50 px-5 py-3.5 shadow-xs animate-slide-up stagger-2">
                <Info className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm text-muted-foreground">
                  Across <strong className="text-foreground">{overallVariance.years}</strong> recorded year{overallVariance.years !== 1 ? "s" : ""}, the actual herd is
                </span>
                <Badge variant={overallVariance.isPositive ? "default" : "destructive"} className="text-sm px-3 shadow-xs">
                  {overallVariance.isPositive ? "+" : ""}{overallVariance.pct.toFixed(1)}%
                </Badge>
                <span className="text-sm text-muted-foreground">{overallVariance.isPositive ? "above" : "below"} projection</span>
              </div>
            )}

            <div className="animate-slide-up stagger-3">
              <ProjectionChart data={projections} />
            </div>
            <div className="animate-slide-up stagger-4">
              <VarianceTable data={projections} />
            </div>

            {/* Guide card */}
            <Card className="border-dashed border-border/60 shadow-xs animate-fade-in">
              <CardContent className="py-5 px-6">
                <div className="flex items-start gap-3">
                  <ClipboardList className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p className="font-semibold text-foreground">How to read this report</p>
                    <ol className="list-decimal list-inside space-y-1 leading-relaxed">
                      <li><strong>MAPE below 10%</strong> — your model is well-calibrated.</li>
                      <li><strong>MAPE 10–25%</strong> — adjust birth rate first.</li>
                      <li><strong>MAPE above 25%</strong> — review mortality & cull rates.</li>
                      <li><strong>Positive bias</strong> — model is optimistic.</li>
                      <li><strong>Negative bias</strong> — reality outperforms assumptions.</li>
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center justify-center min-h-[55vh] text-center px-6 animate-fade-in">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-muted to-muted/40 flex items-center justify-center mb-6 shadow-xs border border-border/30">
              <FileBarChart className="h-10 w-10 text-muted-foreground/40" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>No Data to Compare</h2>
            <p className="text-muted-foreground max-w-sm mb-8 leading-relaxed text-sm">
              Run a herd projection first, then log actual events to see how your herd compares to the model.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card rounded-xl px-4 py-2.5 border border-border/50 shadow-xs">
                <span className="font-medium text-foreground">Step 1</span><ArrowRight className="h-3 w-3" /> Generate a Projection
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card rounded-xl px-4 py-2.5 border border-border/50 shadow-xs">
                <span className="font-medium text-foreground">Step 2</span><ArrowRight className="h-3 w-3" /> Log actual events
              </div>
              <div className="flex items-center gap-2 text-sm text-primary bg-primary/[0.06] rounded-xl px-4 py-2.5 border border-primary/15 shadow-xs">
                <span className="font-medium">Step 3</span><ArrowRight className="h-3 w-3" /> View this report
              </div>
            </div>
            <Button onClick={loadDemo} variant="default" size="lg" className="gap-2 rounded-xl shadow-md">
              <Sparkles className="h-4 w-4" /> Load Demo Data
            </Button>
            <p className="text-xs text-muted-foreground mt-2.5">
              See a sample report with pre-filled projections & actuals
            </p>
          </div>
        )}
      </main>
    </Layout>
  );
}
