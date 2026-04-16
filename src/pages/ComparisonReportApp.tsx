import { useMemo, useState } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { usePdfExport } from "@/hooks/usePdfExport";
import { ExplainReport } from "@/components/ExplainReport";
import { ProjectionChart } from "@/components/ProjectionChart";
import { VarianceTable } from "@/components/VarianceTable";
import {
  HerdData,
  ActualRecord,
  calculateHerdProjection,
  calculateWithActuals,
  calculateMAE,
  calculateMAPE,
  calculateRMSE,
  calculateBias,
  formatNumber,
} from "@/lib/herdCalculations";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  FileBarChart,
  Download,
  Loader2,
  Crosshair,
  Scale,
  Gauge,
  GitCompareArrows,
  Info,
  ClipboardList,
  ArrowRight,
  Sparkles,
} from "lucide-react";

// Pre-built demo data for standalone illustration
const DEMO_PROJECTIONS = calculateHerdProjection(60, 25, 8, 0.85, 0.05, 2, 0.10, 0.50, 4);
const DEMO_ACTUALS: ActualRecord[] = [
  { year: 1, births: 48, deaths: 4, sales: 6 },
  { year: 2, births: 55, deaths: 5, sales: 8 },
  { year: 3, births: 52, deaths: 3, sales: 7 },
  { year: 4, births: 58, deaths: 6, sales: 5 },
  { year: 5, births: 50, deaths: 4, sales: 9 },
];

type ProjectionConfig = {
  adults: number;
  young: number;
  years: number;
  birthRate: number;
  mortalityRate: number;
  cullRate: number;
};

function MetricTile({
  label,
  value,
  unit,
  hint,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  unit?: string;
  hint: string;
  icon: React.ElementType;
  tone: "good" | "warn" | "bad" | "neutral";
}) {
  const toneClasses = {
    good: "border-primary/30 bg-primary/5",
    warn: "border-accent/30 bg-accent/5",
    bad: "border-destructive/30 bg-destructive/5",
    neutral: "border-border bg-muted/30",
  };
  const valueTone = {
    good: "text-primary",
    warn: "text-accent",
    bad: "text-destructive",
    neutral: "text-foreground",
  };

  return (
    <div className={`rounded-xl border-2 p-4 ${toneClasses[tone]} transition-all hover:scale-[1.02]`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      </div>
      <p className={`text-3xl font-display font-bold ${valueTone[tone]}`}>
        {value}
        {unit && <span className="text-base font-normal ml-1">{unit}</span>}
      </p>
      <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{hint}</p>
    </div>
  );
}

export default function ComparisonReportApp() {
  const [baseProjections, setBaseProjections] = useLocalStorage<HerdData[]>("herd-projections", []);
  const [config, setConfig] = useLocalStorage<ProjectionConfig | null>("herd-config", null);
  const [eventRecords, setEventRecords] = useLocalStorage<ActualRecord[]>("event-records", []);
  const [isDemo, setIsDemo] = useState(false);

  const loadDemo = () => {
    setBaseProjections(DEMO_PROJECTIONS);
    setConfig({ adults: 60, young: 25, years: 8, birthRate: 0.85, mortalityRate: 0.05, cullRate: 0.10 });
    setEventRecords(DEMO_ACTUALS);
    setIsDemo(true);
    toast.success("Demo data loaded — explore the report!");
  };

  const { exportToPdf, isExporting } = usePdfExport();

  const projections = useMemo(() => {
    if (!baseProjections.length || !eventRecords.length) return baseProjections;
    return calculateWithActuals(baseProjections, eventRecords);
  }, [baseProjections, eventRecords]);

  const hasProjections = baseProjections.length > 0;
  const hasActuals = eventRecords.length > 0;
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
        subtitle: `Projected vs Actual • ${eventRecords.length} data points`,
      });
      toast.success("PDF saved!");
    } catch {
      toast.error("Export failed — try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ── Top bar ── */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileBarChart className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h1 className="text-base font-display font-bold text-foreground leading-tight">
                Variance Analysis
              </h1>
              <p className="text-[11px] text-muted-foreground">Projected vs Actual</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hasProjections && (
              <>
                <ExplainReport projections={projections} config={config} actuals={eventRecords} mode="comparison" />
                <Button onClick={handleExport} disabled={isExporting} variant="outline" size="sm" className="gap-1.5">
                  {isExporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                  PDF
                </Button>
              </>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      <main className="max-w-5xl mx-auto px-5 py-6 space-y-6" id="comparison-content">
        {hasProjections ? (
          <>
            {/* Accuracy Metrics Strip */}
            {hasMetrics && (
              <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {mae !== null && (
                  <MetricTile
                    label="MAE"
                    value={mae.toFixed(1)}
                    unit="head"
                    hint="Average absolute deviation per year"
                    icon={Crosshair}
                    tone="neutral"
                  />
                )}
                {mape !== null && (
                  <MetricTile
                    label="MAPE"
                    value={mape.toFixed(1)}
                    unit="%"
                    hint={mape < 10 ? "Excellent accuracy" : mape < 25 ? "Moderate — review rates" : "High deviation — recalibrate"}
                    icon={Gauge}
                    tone={mape < 10 ? "good" : mape < 25 ? "warn" : "bad"}
                  />
                )}
                {rmse !== null && (
                  <MetricTile
                    label="RMSE"
                    value={rmse.toFixed(1)}
                    unit="head"
                    hint="Penalises large single-year misses"
                    icon={Scale}
                    tone="neutral"
                  />
                )}
                {bias !== null && (
                  <MetricTile
                    label="Bias"
                    value={`${bias > 0 ? "+" : ""}${bias.toFixed(1)}`}
                    hint={bias > 5 ? "Model is over-projecting" : bias < -5 ? "Model is under-projecting" : "Well balanced"}
                    icon={GitCompareArrows}
                    tone={Math.abs(bias) > 5 ? "warn" : "good"}
                  />
                )}
              </section>
            )}

            {/* Overall Variance Badge */}
            {overallVariance && (
              <div className="flex items-center gap-3 bg-muted/40 rounded-xl border border-border px-5 py-3">
                <Info className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm text-muted-foreground">
                  Across <strong className="text-foreground">{overallVariance.years}</strong> recorded year{overallVariance.years !== 1 ? "s" : ""}, the actual herd is
                </span>
                <Badge variant={overallVariance.isPositive ? "default" : "destructive"} className="text-sm px-3">
                  {overallVariance.isPositive ? "+" : ""}
                  {overallVariance.pct.toFixed(1)}%
                </Badge>
                <span className="text-sm text-muted-foreground">{overallVariance.isPositive ? "above" : "below"} projection</span>
              </div>
            )}

            {/* Chart */}
            <ProjectionChart data={projections} />

            {/* Variance Table */}
            <VarianceTable data={projections} />

            {/* How to read section */}
            <Card className="border-dashed">
              <CardContent className="py-5 px-6">
                <div className="flex items-start gap-3">
                  <ClipboardList className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p className="font-semibold text-foreground">How to read this report</p>
                    <ol className="list-decimal list-inside space-y-1 leading-relaxed">
                      <li><strong>MAPE below 10%</strong> — your model is well-calibrated, keep current rates.</li>
                      <li><strong>MAPE 10–25%</strong> — adjust birth rate first (largest single effect).</li>
                      <li><strong>MAPE above 25%</strong> — real-world conditions differ significantly; review mortality & cull rates.</li>
                      <li><strong>Positive bias</strong> — model is optimistic; lower birth rate or raise mortality.</li>
                      <li><strong>Negative bias</strong> — reality outperforms assumptions; consider reducing cull rate.</li>
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          /* ── Empty state ── */
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
            <div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center mb-6">
              <FileBarChart className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <h2 className="text-2xl font-display font-bold text-foreground mb-2">
              No Data to Compare
            </h2>
            <p className="text-muted-foreground max-w-sm mb-6 leading-relaxed">
              {!hasProjections
                ? "Run a herd projection first, then log actual events to see how your herd compares to the model."
                : "You have projections but no event records yet. Log births, deaths, and sales to start comparing."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-4 py-2">
                <span className="font-medium text-foreground">Step 1</span>
                <ArrowRight className="h-3 w-3" />
                Generate a Herd Projection
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-4 py-2">
                <span className="font-medium text-foreground">Step 2</span>
                <ArrowRight className="h-3 w-3" />
                Log actual events
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-primary/10 rounded-lg px-4 py-2">
                <span className="font-medium text-primary">Step 3</span>
                <ArrowRight className="h-3 w-3 text-primary" />
                <span className="text-primary">View this report</span>
              </div>
            </div>
            <Button onClick={loadDemo} variant="default" size="lg" className="mt-8 gap-2">
              <Sparkles className="h-4 w-4" />
              Load Demo Data
            </Button>
            <p className="text-xs text-muted-foreground mt-2">See a sample report with pre-filled projections & actuals</p>
          </div>
        )}
      </main>
    </div>
  );
}
