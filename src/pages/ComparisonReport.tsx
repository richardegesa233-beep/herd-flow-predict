import { Layout } from "@/components/Layout";
import { ProjectionChart } from "@/components/ProjectionChart";
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
import { BarChart3, TrendingUp, TrendingDown, Target, AlertTriangle, Download, Loader2, Activity, Percent } from "lucide-react";
import { toast } from "sonner";
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

  // Merge projections with event logging actuals
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

  // Calculate variance metrics
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
      <div className="container max-w-5xl mx-auto px-4 py-8">
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

        {/* Content */}
        <div className="space-y-6" id="comparison-report">
          {hasProjections && hasActuals ? (
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
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors animate-slide-up"
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
                      <h3 className="font-semibold text-lg mb-2">No Matching Data</h3>
                      <p className="text-muted-foreground max-w-sm">
                        Your event log years don't overlap with projection years yet. Add matching year records in Event Logging.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
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
