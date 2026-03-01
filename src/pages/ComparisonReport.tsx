import { Layout } from "@/components/Layout";
import { ProjectionChart } from "@/components/ProjectionChart";
import { VarianceTable } from "@/components/VarianceTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePdfExport } from "@/hooks/usePdfExport";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { 
  HerdData, 
  ActualRecord, 
  calculateWithActuals,
  calculateMAE,
  calculateMAPE,
  calculateRMSE,
  calculateBias,
  formatNumber 
} from "@/lib/herdCalculations";
import { BarChart3, TrendingUp, TrendingDown, Target, AlertTriangle, Download, Loader2, Activity, Percent, Sigma, ArrowUpDown } from "lucide-react";
import { toast } from "sonner";
import { ExplainReport } from "@/components/ExplainReport";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

type ProjectionConfig = {
  adults: number;
  young: number;
  years: number;
  birthRate: number;
  mortalityRate: number;
  cullRate: number;
};

const ComparisonReport = () => {
  const [baseProjections] = useLocalStorage<HerdData[]>("herd-projections", []);
  const [config] = useLocalStorage<ProjectionConfig | null>("herd-config", null);
  const [eventRecords] = useLocalStorage<ActualRecord[]>("event-records", []);
  const navigate = useNavigate();

  const { exportToPdf, isExporting } = usePdfExport();

  const projections = useMemo(() => {
    if (!baseProjections.length || !eventRecords.length) return baseProjections;
    return calculateWithActuals(baseProjections, eventRecords);
  }, [baseProjections, eventRecords]);

  const handleExportPdf = async () => {
    try {
      await exportToPdf("comparison-report", {
        filename: `comparison-report-${new Date().toISOString().split("T")[0]}.pdf`,
        title: "Herd Comparison Report",
        subtitle: `Projected vs Actual Performance • ${eventRecords.length} data points recorded`,
      });
      toast.success("PDF exported successfully!");
    } catch (error) {
      toast.error("Failed to export PDF. Please try again.");
    }
  };

  const metrics = useMemo(() => {
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
  }, [projections]);

  const hasProjections = baseProjections.length > 0;
  const hasActuals = eventRecords.length > 0;

  return (
    <Layout>
      <div className="container max-w-6xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-slide-up">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">
              Comparison Report
            </h1>
            <p className="text-muted-foreground">
              Projected vs actual herd performance using your event log data.
            </p>
          </div>
          {hasProjections && (
            <div className="flex flex-wrap gap-2">
              <ExplainReport projections={projections} config={config} actuals={eventRecords} mode="comparison" />
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

        {/* Content */}
        <div className="space-y-6" id="comparison-report">
          {hasProjections ? (
            <>
              {/* Chart */}
              <div className="animate-slide-in-right">
                <ProjectionChart data={projections} />
              </div>

              {/* Accuracy Metrics */}
              {metrics && (() => {
                const mae = calculateMAE(projections);
                const mape = calculateMAPE(projections);
                const rmse = calculateRMSE(projections);
                const bias = calculateBias(projections);
                const hasMetrics = [mae, mape, rmse, bias].some(m => m !== null);
                return hasMetrics ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up stagger-1">
                    {mae !== null && (
                      <Card className="hover-lift">
                        <CardHeader className="pb-2">
                          <CardDescription className="flex items-center gap-2">
                            <Activity className="h-4 w-4 text-primary" />
                            MAE
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-display font-bold text-primary">
                            {mae.toFixed(1)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Avg deviation in head count
                          </p>
                        </CardContent>
                      </Card>
                    )}
                    {mape !== null && (
                      <Card className="hover-lift">
                        <CardHeader className="pb-2">
                          <CardDescription className="flex items-center gap-2">
                            <Percent className="h-4 w-4 text-accent" />
                            MAPE
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className={`text-2xl font-display font-bold ${mape < 10 ? 'text-primary' : mape < 25 ? 'text-amber-600' : 'text-destructive'}`}>
                            {mape.toFixed(1)}%
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {mape < 10 ? 'Excellent accuracy' : mape < 25 ? 'Moderate accuracy' : 'Review parameters'}
                          </p>
                        </CardContent>
                      </Card>
                    )}
                    {rmse !== null && (
                      <Card className="hover-lift">
                        <CardHeader className="pb-2">
                          <CardDescription className="flex items-center gap-2">
                            <Sigma className="h-4 w-4 text-primary" />
                            RMSE
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-display font-bold text-primary">
                            {rmse.toFixed(1)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Penalises large errors more
                          </p>
                        </CardContent>
                      </Card>
                    )}
                    {bias !== null && (
                      <Card className="hover-lift">
                        <CardHeader className="pb-2">
                          <CardDescription className="flex items-center gap-2">
                            <ArrowUpDown className="h-4 w-4 text-accent" />
                            Bias
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className={`text-2xl font-display font-bold ${bias > 0 ? 'text-amber-600' : 'text-primary'}`}>
                            {bias > 0 ? '+' : ''}{bias.toFixed(1)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {bias > 0 ? 'Over-projecting' : bias < 0 ? 'Under-projecting' : 'No bias'}
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                ) : null;
              })()}

              {/* Overall Variance Summary */}
              {metrics && (
                <Card className="animate-slide-up stagger-2 hover-lift">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Variance Summary
                    </CardTitle>
                    <CardDescription>
                      Overall performance comparison
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
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
                            Across {metrics.variances.length} recorded year{metrics.variances.length !== 1 ? 's' : ''}
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
                  </CardContent>
                </Card>
              )}

              {/* Detailed All-Years Variance Table */}
              <div className="animate-slide-up stagger-3">
                <VarianceTable data={projections} />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[400px] bg-muted/30 rounded-xl border-2 border-dashed border-muted-foreground/20 p-8 animate-fade-in">
              <div className="text-center space-y-4">
                <div className="animate-float">
                  <Target className="h-16 w-16 text-muted-foreground/40 mx-auto" />
                </div>
                <h3 className="text-2xl font-display font-semibold text-muted-foreground">
                  {!hasProjections ? "No Projection Data" : "No Event Records"}
                </h3>
                <p className="text-muted-foreground max-w-md">
                  {!hasProjections
                    ? "Generate a herd projection first, then log actual events to see how your herd compares."
                    : "You have projections but no event records yet. Log births, deaths, and sales in Event Logging to compare."}
                </p>
                <Button
                  variant="outline"
                  onClick={() => navigate(!hasProjections ? "/herd-projection" : "/event-logging")}
                  className="mt-2"
                >
                  Go to {!hasProjections ? "Herd Projection" : "Event Logging"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ComparisonReport;