import { useState, useRef } from "react";
import { Layout } from "@/components/Layout";
import { HerdInputForm } from "@/components/HerdInputForm";
import { ProjectionTable } from "@/components/ProjectionTable";
import { ProjectionChart } from "@/components/ProjectionChart";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { usePdfExport } from "@/hooks/usePdfExport";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { 
  HerdData, 
  calculateHerdProjection, 
  formatNumber 
} from "@/lib/herdCalculations";
import { Beef, TrendingUp, Target, Calendar, Download, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ExplainReport } from "@/components/ExplainReport";

type ProjectionConfig = {
  femaleAdults: number;
  maleAdults: number;
  young: number;
  years: number;
  birthRate: number;
  mortalityRate: number;
  cullRate: number;
};

const HerdProjection = () => {
  const [projections, setProjections] = useLocalStorage<HerdData[]>("herd-projections", []);
  const [config, setConfig] = useLocalStorage<ProjectionConfig | null>("herd-config", null);

  const handleClearData = () => {
    setProjections([]);
    setConfig(null);
    toast.success("Saved projection data cleared.");
  };

  const { exportToPdf, isExporting } = usePdfExport();

  const handleGenerateProjection = (data: {
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
      data.cullRate
    );
    setProjections(results);
    setConfig(data);
  };

  const handleExportPdf = async () => {
    try {
      await exportToPdf("projection-report", {
        filename: `herd-projection-${new Date().toISOString().split("T")[0]}.pdf`,
        title: "Herd Growth Projection Report",
        subtitle: `${config?.years} Year Forecast • Birth Rate: ${((config?.birthRate || 0) * 100).toFixed(0)}% • Mortality: ${((config?.mortalityRate || 0) * 100).toFixed(0)}% • Cull: ${((config?.cullRate || 0) * 100).toFixed(0)}%`,
      });
      toast.success("PDF exported successfully!");
    } catch (error) {
      toast.error("Failed to export PDF. Please try again.");
    }
  };

  const finalData = projections[projections.length - 1];
  const initialData = projections[0];
  const growthPercent = initialData && finalData 
    ? ((finalData.total - initialData.total) / initialData.total * 100).toFixed(1)
    : "0";

  return (
    <Layout>
      <div className="container max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-slide-up">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">
              Herd Projection
            </h1>
            <p className="text-muted-foreground">
              Enter your current herd details to generate Fibonacci-based growth projections.
            </p>
          </div>
          {projections.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={handleClearData} 
                className="gap-2"
                variant="ghost"
                size="sm"
              >
                <Trash2 className="h-4 w-4" />
                Clear
              </Button>
              <ExplainReport projections={projections} config={config} mode="projection" />
              <Button 
                onClick={handleExportPdf} 
                disabled={isExporting}
                className="gap-2 hover-lift"
                variant="outline"
              >
                {isExporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Export PDF
              </Button>
            </div>
          )}
        </div>

        {/* Stats Summary */}
        {projections.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="animate-slide-up stagger-1">
              <StatCard
                title="Starting Herd"
                value={formatNumber(initialData?.total || 0)}
                subtitle="Total cattle"
                icon={Beef}
                variant="primary"
              />
            </div>
            <div className="animate-slide-up stagger-2">
              <StatCard
                title="Final Projection"
                value={formatNumber(finalData?.total || 0)}
                subtitle={`Year ${config?.years || 0}`}
                icon={Target}
                variant="accent"
              />
            </div>
            <div className="animate-slide-up stagger-3">
              <StatCard
                title="Total Growth"
                value={`${growthPercent}%`}
                subtitle="Over projection period"
                icon={TrendingUp}
                variant="primary"
              />
            </div>
            <div className="animate-slide-up stagger-4">
              <StatCard
                title="Projection Years"
                value={config?.years || 0}
                subtitle="Planning horizon"
                icon={Calendar}
                variant="muted"
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Form */}
          <div className="lg:col-span-1 animate-slide-in-left">
            <HerdInputForm onSubmit={handleGenerateProjection} initialValues={config} />
          </div>

          {/* Results */}
          <div className="lg:col-span-2 space-y-6" id="projection-report">
            {projections.length > 0 ? (
              <>
                <div className="animate-slide-in-right">
                  <ProjectionChart data={projections} />
                </div>
                <div className="animate-slide-up stagger-2">
                  <ProjectionTable data={projections} />
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-muted/30 rounded-xl border-2 border-dashed border-muted-foreground/20 p-8 animate-fade-in">
                <div className="text-center space-y-4">
                  <div className="animate-float">
                    <Beef className="h-16 w-16 text-muted-foreground/40 mx-auto" />
                  </div>
                  <h3 className="text-2xl font-display font-semibold text-muted-foreground">
                    Ready to Project Your Herd Growth?
                  </h3>
                  <p className="text-muted-foreground max-w-md">
                    Enter your current herd details in the form to generate 
                    Fibonacci-based growth projections for your cattle operation.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HerdProjection;
