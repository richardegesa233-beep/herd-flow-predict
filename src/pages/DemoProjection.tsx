import { useState } from "react";
import { Link } from "react-router-dom";
import { HerdInputForm } from "@/components/HerdInputForm";
import { ProjectionTable } from "@/components/ProjectionTable";
import { ProjectionChart } from "@/components/ProjectionChart";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { HerdData, calculateHerdProjection, formatNumber } from "@/lib/herdCalculations";
import { Beef, TrendingUp, Target, Calendar, Download, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { usePdfExport } from "@/hooks/usePdfExport";

const INITIAL_CONFIG = {
  femaleAdults: 60,
  maleAdults: 4,
  young: 25,
  years: 8,
  birthRate: 0.85,
  mortalityRate: 0.05,
  cullRate: 0.10,
};

const INITIAL_PROJECTIONS = calculateHerdProjection(
  INITIAL_CONFIG.femaleAdults,
  INITIAL_CONFIG.young,
  INITIAL_CONFIG.years,
  INITIAL_CONFIG.birthRate,
  INITIAL_CONFIG.mortalityRate,
  2,
  INITIAL_CONFIG.cullRate,
  0.50,
  INITIAL_CONFIG.maleAdults
);

const DemoProjection = () => {
  const [projections, setProjections] = useState<HerdData[]>(INITIAL_PROJECTIONS);
  const [config, setConfig] = useState(INITIAL_CONFIG);
  const { exportToPdf, isExporting } = usePdfExport();

  const handleGenerate = (data: {
    femaleAdults: number;
    maleAdults: number;
    young: number;
    years: number;
    birthRate: number;
    mortalityRate: number;
    cullRate: number;
  }) => {
    const results = calculateHerdProjection(
      data.femaleAdults,
      data.young,
      data.years,
      data.birthRate,
      data.mortalityRate,
      2,
      data.cullRate,
      0.50,
      data.maleAdults
    );
    setProjections(results);
    setConfig(data);
    toast.success("Projection generated!");
  };

  const handleClear = () => {
    setProjections(INITIAL_PROJECTIONS);
    setConfig(INITIAL_CONFIG);
    toast.success("Reset to sample data.");
  };

  const handleExportPdf = async () => {
    try {
      await exportToPdf("projection-report", {
        filename: `herd-projection-${new Date().toISOString().split("T")[0]}.pdf`,
        title: "Herd Growth Projection Report",
        subtitle: `${config.years} Year Forecast • Birth Rate: ${(config.birthRate * 100).toFixed(0)}% • Mortality: ${(config.mortalityRate * 100).toFixed(0)}% • Cull: ${(config.cullRate * 100).toFixed(0)}%`,
      });
      toast.success("PDF exported!");
    } catch {
      toast.error("Failed to export PDF.");
    }
  };

  const finalData = projections[projections.length - 1];
  const initialData = projections[0];
  const growthPercent = initialData && finalData
    ? ((finalData.total - initialData.total) / initialData.total * 100).toFixed(1)
    : "0";

  return (
    <div className="min-h-screen bg-background">
      {/* Standalone Header */}
      <header className="bg-background border-b border-border sticky top-0 z-50">
        <div className="container max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Beef className="h-7 w-7 text-primary" />
            <div>
              <span className="font-display text-xl font-bold tracking-wider text-primary">
                FHPS
              </span>
              <span className="hidden sm:inline text-xs text-muted-foreground ml-2">
                Herd Projection
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-slide-up">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">
              Herd Projection
            </h1>
            <p className="text-muted-foreground">
              Enter your herd details to generate Fibonacci-based growth projections.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleClear} variant="ghost" size="sm" className="gap-2">
              <Trash2 className="h-4 w-4" /> Reset
            </Button>
            <Button onClick={handleExportPdf} disabled={isExporting} variant="outline" size="sm" className="gap-2">
              {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Export PDF
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="animate-slide-up stagger-1">
            <StatCard title="Starting Herd" value={formatNumber(initialData?.total || 0)} subtitle="Total cattle" icon={Beef} variant="primary" />
          </div>
          <div className="animate-slide-up stagger-2">
            <StatCard title="Final Projection" value={formatNumber(finalData?.total || 0)} subtitle={`Year ${config.years}`} icon={Target} variant="accent" />
          </div>
          <div className="animate-slide-up stagger-3">
            <StatCard title="Total Growth" value={`${growthPercent}%`} subtitle="Over projection period" icon={TrendingUp} variant="primary" />
          </div>
          <div className="animate-slide-up stagger-4">
            <StatCard title="Projection Years" value={config.years} subtitle="Planning horizon" icon={Calendar} variant="muted" />
          </div>
        </div>

        {/* Form + Results */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 animate-slide-in-left">
            <HerdInputForm onSubmit={handleGenerate} initialValues={config} />
          </div>
          <div className="lg:col-span-2 space-y-6" id="projection-report">
            <div className="animate-slide-in-right">
              <ProjectionChart data={projections} />
            </div>
            <div className="animate-slide-up stagger-2">
              <ProjectionTable data={projections} />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-muted/50 py-8 mt-12">
        <div className="container max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p className="font-display font-semibold">FHPS • Fibonacci-Based Herd Projection System</p>
          <p className="mt-1">Herd Projection Module — Standalone Demo</p>
        </div>
      </footer>
    </div>
  );
};

export default DemoProjection;
