import { useState } from "react";
import { HerdInputForm } from "@/components/HerdInputForm";
import { ProjectionTable } from "@/components/ProjectionTable";
import { ProjectionChart } from "@/components/ProjectionChart";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { usePdfExport } from "@/hooks/usePdfExport";
import { HerdData, calculateHerdProjection, formatNumber } from "@/lib/herdCalculations";
import { Anvil, BarChart3, Crosshair, Clock, FileDown, Loader2, RotateCcw, LineChart, TableProperties } from "lucide-react";
import { toast } from "sonner";
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
import { ExplainReport } from "@/components/ExplainReport";
import { ProjectionHistory, ProjectionSnapshot } from "@/components/ProjectionHistory";
import { Card, CardContent } from "@/components/ui/card";

const DEFAULT = {
  femaleAdults: 60,
  maleAdults: 4,
  young: 25,
  years: 8,
  birthRate: 0.85,
  mortalityRate: 0.05,
  cullRate: 0.10,
};

function generate(c: typeof DEFAULT) {
  return calculateHerdProjection(
    c.femaleAdults, c.young, c.years, c.birthRate,
    c.mortalityRate, 2, c.cullRate, 0.50, c.maleAdults
  );
}

const HerdProjectionApp = () => {
  const [config, setConfig] = useState(DEFAULT);
  const [projections, setProjections] = useState<HerdData[]>([]);
  const [hasGenerated, setHasGenerated] = useState(false);
  const { exportToPdf, isExporting } = usePdfExport();

  const handleGenerate = (data: typeof DEFAULT) => {
    setConfig(data);
    setProjections(generate(data));
    setHasGenerated(true);
    toast.success("Projection generated!");
  };

  const handleReset = () => {
    setConfig(DEFAULT);
    setProjections([]);
    setHasGenerated(false);
    toast.success("Everything cleared and reset to defaults.");
  };

  const handleLoadSnapshot = (snapshot: ProjectionSnapshot) => {
    setProjections(snapshot.projections);
    setConfig(snapshot.config);
    setHasGenerated(true);
  };

  const handleExport = async () => {
    try {
      await exportToPdf("projection-report", {
        filename: `herd-projection-${new Date().toISOString().split("T")[0]}.pdf`,
        title: "Herd Growth Projection Report",
        subtitle: `${config.years} Year Forecast • Birth ${(config.birthRate * 100).toFixed(0)}% • Mortality ${(config.mortalityRate * 100).toFixed(0)}% • Cull ${(config.cullRate * 100).toFixed(0)}%`,
      });
      toast.success("PDF exported!");
    } catch {
      toast.error("Export failed.");
    }
  };

  const first = projections[0];
  const last = projections[projections.length - 1];
  const growth = first && last
    ? ((last.total - first.total) / first.total * 100).toFixed(1)
    : "0";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background border-b border-border sticky top-0 z-50">
        <div className="container max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Anvil className="h-7 w-7 text-primary" />
            <div>
              <span className="font-display text-2xl font-bold tracking-wider text-primary">FHPS</span>
              <div className="hidden sm:block text-xs leading-tight text-muted-foreground ml-3">
                <span>Fibonacci-Based Herd Projection System</span>
              </div>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main */}
      <main className="container max-w-7xl mx-auto px-4 py-8">
        {/* Title + Actions */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-slide-up">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">Herd Projection</h1>
            <p className="text-muted-foreground">
              Configure your herd to generate Fibonacci-based growth projections.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <RotateCcw className="h-4 w-4" /> Reset
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset Everything?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will clear all current inputs, projections, and chart data back to defaults. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleReset}>Yes, Reset All</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <ProjectionHistory
              currentProjections={projections}
              currentConfig={config}
              onLoad={handleLoadSnapshot}
            />
            {hasGenerated && (
              <>
                <ExplainReport projections={projections} config={config} mode="projection" />
                <Button onClick={handleExport} disabled={isExporting} variant="outline" size="sm" className="gap-2">
                  {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
                  Export PDF
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Stats — only show after generation */}
        {hasGenerated && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="animate-slide-up stagger-1">
              <StatCard title="Starting Herd" value={formatNumber(first?.total || 0)} subtitle="Total cattle" icon={Anvil} variant="primary" />
            </div>
            <div className="animate-slide-up stagger-2">
              <StatCard title="Final Projection" value={formatNumber(last?.total || 0)} subtitle={`Year ${config.years}`} icon={Crosshair} variant="accent" />
            </div>
            <div className="animate-slide-up stagger-3">
              <StatCard title="Total Growth" value={`${growth}%`} subtitle="Over projection period" icon={BarChart3} variant="primary" />
            </div>
            <div className="animate-slide-up stagger-4">
              <StatCard title="Projection Years" value={config.years} subtitle="Planning horizon" icon={Clock} variant="muted" />
            </div>
          </div>
        )}

        {/* Form + Results */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 animate-slide-in-left">
            <HerdInputForm key={JSON.stringify(config)} onSubmit={handleGenerate} initialValues={config} />
          </div>
          <div className="lg:col-span-2 space-y-6" id="projection-report">
            {hasGenerated ? (
              <>
                <div className="animate-slide-in-right">
                  <ProjectionChart data={projections} />
                </div>
                <div className="animate-slide-up stagger-2">
                  <ProjectionTable data={projections} />
                </div>
              </>
            ) : (
              <Card className="shadow-card">
                <CardContent className="flex flex-col items-center justify-center py-24 text-center space-y-4">
                  <div className="flex gap-3 text-muted-foreground/40">
                    <LineChart className="h-12 w-12" />
                    <TableProperties className="h-12 w-12" />
                  </div>
                  <h3 className="text-xl font-display font-semibold text-muted-foreground">No Projection Yet</h3>
                  <p className="text-sm text-muted-foreground/70 max-w-md">
                    Configure your herd parameters on the left and hit <strong>Generate Projection</strong> to see your growth chart and detailed table here.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-muted/50 py-8 mt-12">
        <div className="container max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p className="font-display font-semibold">FHPS • Fibonacci-Based Herd Projection System</p>
          <p className="mt-1">For farmers, farm managers, and agricultural students</p>
        </div>
      </footer>
    </div>
  );
};

export default HerdProjectionApp;
