import { Layout } from "@/components/Layout";
import { HerdInputForm } from "@/components/HerdInputForm";
import { ProjectionChart } from "@/components/ProjectionChart";
import { ActualDataForm } from "@/components/ActualDataForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePdfExport } from "@/hooks/usePdfExport";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { 
  HerdData, 
  ActualRecord, 
  calculateHerdProjection, 
  calculateWithActuals,
  calculateMAE,
  calculateMAPE,
  formatNumber 
} from "@/lib/herdCalculations";
import { BarChart3, TrendingUp, TrendingDown, Target, AlertTriangle, Download, Loader2, Activity, Percent, Trash2 } from "lucide-react";
import { toast } from "sonner";

type ComparisonConfig = {
  adults: number;
  young: number;
  years: number;
  birthRate: number;
  mortalityRate: number;
};

const ComparisonReport = () => {
  const [projections, setProjections] = useLocalStorage<HerdData[]>("comparison-projections", []);
  const [actuals, setActuals] = useLocalStorage<ActualRecord[]>("comparison-actuals", []);
  const [config, setConfig] = useLocalStorage<ComparisonConfig | null>("comparison-config", null);

  const { exportToPdf, isExporting } = usePdfExport();

  const handleGenerateProjection = (data: {
    adults: number;
    young: number;
    years: number;
    birthRate: number;
    mortalityRate: number;
  }) => {
    const results = calculateHerdProjection(
      data.adults,
      data.young,
      data.years,
      data.birthRate,
      data.mortalityRate
    );
    setProjections(results);
    setConfig(data);
    setActuals([]);
  };
  const handleClearData = () => {
    setProjections([]);
    setActuals([]);
    setConfig(null);
    toast.success("Comparison data cleared.");
  };

  const handleAddActual = (record: ActualRecord) => {
    const newActuals = [...actuals, record];
    setActuals(newActuals);
    if (projections.length > 0) {
      const updated = calculateWithActuals(projections, newActuals);
      setProjections(updated);
    }
  };

  const handleRemoveActual = (year: number) => {
    const newActuals = actuals.filter(a => a.year !== year);
    setActuals(newActuals);
    if (config) {
      const baseProjections = calculateHerdProjection(
        config.adults,
        config.young,
        config.years,
        config.birthRate,
        config.mortalityRate
      );
      const updated = calculateWithActuals(baseProjections, newActuals);
      setProjections(updated);
    }
  };

  const handleExportPdf = async () => {
    try {
      await exportToPdf("comparison-report", {
        filename: `comparison-report-${new Date().toISOString().split("T")[0]}.pdf`,
        title: "Herd Comparison Report",
        subtitle: `Projected vs Actual Performance • ${actuals.length} data points recorded`,
      });
      toast.success("PDF exported successfully!");
    } catch (error) {
      toast.error("Failed to export PDF. Please try again.");
    }
  };

  // Calculate variance metrics
  const getVarianceMetrics = () => {
    if (!projections.length) return null;
    
    const yearsWithActuals = projections.filter(p => p.actualTotal !== undefined);
    if (!yearsWithActuals.length) return null;

    const variances = yearsWithActuals.map(p => ({
      year: p.year,
      projected: p.total,
      actual: p.actualTotal!,
      variance: p.actualTotal! - p.total,
      variancePercent: ((p.actualTotal! - p.total) / p.total * 100).toFixed(1)
    }));

    const totalProjected = yearsWithActuals.reduce((sum, p) => sum + p.total, 0);
    const totalActual = yearsWithActuals.reduce((sum, p) => sum + p.actualTotal!, 0);
    const avgVariance = ((totalActual - totalProjected) / totalProjected * 100).toFixed(1);

    return { variances, avgVariance, isPositive: totalActual >= totalProjected };
  };

  const metrics = getVarianceMetrics();

  return (
    <Layout>
      <div className="container max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-slide-up">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">
              Comparison Report
            </h1>
            <p className="text-muted-foreground">
              Compare your actual herd performance against Fibonacci-based projections.
            </p>
          </div>
          {projections.length > 0 && (
            <div className="flex gap-2">
              <Button 
                onClick={handleClearData} 
                className="gap-2"
                variant="ghost"
                size="sm"
              >
                <Trash2 className="h-4 w-4" />
                Clear
              </Button>
              {metrics && (
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
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Forms */}
          <div className="lg:col-span-1 space-y-6">
            <div className="animate-slide-in-left">
              <HerdInputForm onSubmit={handleGenerateProjection} />
            </div>
            
            {projections.length > 0 && config && (
              <div className="animate-slide-in-left stagger-2">
                <ActualDataForm
                  maxYear={config.years}
                  onAdd={handleAddActual}
                  records={actuals}
                  onRemove={handleRemoveActual}
                />
              </div>
            )}
          </div>

          {/* Comparison Results */}
          <div className="lg:col-span-2 space-y-6" id="comparison-report">
            {projections.length > 0 ? (
              <>
                {/* Chart */}
                <div className="animate-slide-in-right">
                  <ProjectionChart data={projections} />
                </div>

                {/* MAE / MAPE Accuracy Metrics */}
                {metrics && (() => {
                  const mae = calculateMAE(projections);
                  const mape = calculateMAPE(projections);
                  return (mae !== null || mape !== null) ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-slide-up stagger-1">
                      {mae !== null && (
                        <Card className="hover-lift">
                          <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2">
                              <Activity className="h-4 w-4 text-primary" />
                              Mean Absolute Error (MAE)
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p className="text-3xl font-display font-bold text-primary">
                              {mae.toFixed(1)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Average deviation in head count
                            </p>
                          </CardContent>
                        </Card>
                      )}
                      {mape !== null && (
                        <Card className="hover-lift">
                          <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2">
                              <Percent className="h-4 w-4 text-accent" />
                              Mean Absolute % Error (MAPE)
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p className={`text-3xl font-display font-bold ${mape < 10 ? 'text-green-600' : mape < 25 ? 'text-amber-600' : 'text-destructive'}`}>
                              {mape.toFixed(1)}%
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {mape < 10 ? 'Excellent accuracy' : mape < 25 ? 'Moderate accuracy' : 'Low accuracy — review parameters'}
                            </p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  ) : null;
                })()}

                {/* Variance Analysis */}
                {metrics ? (
                  <Card className="animate-slide-up stagger-2 hover-lift">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Variance Analysis
                      </CardTitle>
                      <CardDescription>
                        Comparing actual performance to projections
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Overall Variance */}
                      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {metrics.isPositive ? (
                            <div className="p-2 rounded-full bg-primary/10">
                              <TrendingUp className="h-6 w-6 text-primary" />
                            </div>
                          ) : (
                            <div className="p-2 rounded-full bg-destructive/10">
                              <TrendingDown className="h-6 w-6 text-destructive" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">Average Variance</p>
                            <p className="text-sm text-muted-foreground">
                              Across all recorded years
                            </p>
                          </div>
                        </div>
                        <Badge 
                          variant={metrics.isPositive ? "default" : "destructive"}
                          className="text-lg px-4 py-1"
                        >
                          {metrics.isPositive ? '+' : ''}{metrics.avgVariance}%
                        </Badge>
                      </div>

                      {/* Year-by-Year Breakdown */}
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">
                          Year-by-Year Comparison
                        </p>
                        {metrics.variances.map((v, index) => (
                          <div
                            key={v.year}
                            className={`flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors animate-slide-up`}
                            style={{ animationDelay: `${index * 0.1}s` }}
                          >
                            <div className="flex items-center gap-4">
                              <Badge variant="outline">Year {v.year}</Badge>
                              <div className="text-sm">
                                <span className="text-muted-foreground">Projected: </span>
                                <span className="font-medium">{formatNumber(v.projected)}</span>
                                <span className="mx-2 text-muted-foreground">→</span>
                                <span className="text-muted-foreground">Actual: </span>
                                <span className="font-medium">{formatNumber(v.actual)}</span>
                              </div>
                            </div>
                            <span className={`font-semibold ${v.variance >= 0 ? 'text-primary' : 'text-destructive'}`}>
                              {v.variance >= 0 ? '+' : ''}{v.variancePercent}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="animate-fade-in">
                    <CardContent className="py-12">
                      <div className="flex flex-col items-center text-center">
                        <div className="animate-pulse-soft">
                          <AlertTriangle className="h-12 w-12 text-muted-foreground/40 mb-4" />
                        </div>
                        <h3 className="font-semibold text-lg mb-2">No Actual Data Yet</h3>
                        <p className="text-muted-foreground max-w-sm">
                          Add actual birth and death records using the form to compare against projections.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-muted/30 rounded-xl border-2 border-dashed border-muted-foreground/20 p-8 animate-fade-in">
                <div className="text-center space-y-4">
                  <div className="animate-float">
                    <Target className="h-16 w-16 text-muted-foreground/40 mx-auto" />
                  </div>
                  <h3 className="text-2xl font-display font-semibold text-muted-foreground">
                    Start Your Comparison
                  </h3>
                  <p className="text-muted-foreground max-w-md">
                    First, generate a projection using the form. Then add actual data 
                    to compare real performance against predictions.
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

export default ComparisonReport;
