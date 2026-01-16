import { useState } from "react";
import { Layout } from "@/components/Layout";
import { HerdInputForm } from "@/components/HerdInputForm";
import { ProjectionChart } from "@/components/ProjectionChart";
import { ActualDataForm } from "@/components/ActualDataForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  HerdData, 
  ActualRecord, 
  calculateHerdProjection, 
  calculateWithActuals,
  formatNumber 
} from "@/lib/herdCalculations";
import { BarChart3, TrendingUp, TrendingDown, Target, AlertTriangle } from "lucide-react";

const ComparisonReport = () => {
  const [projections, setProjections] = useState<HerdData[]>([]);
  const [actuals, setActuals] = useState<ActualRecord[]>([]);
  const [config, setConfig] = useState<{
    adults: number;
    young: number;
    years: number;
    birthRate: number;
    mortalityRate: number;
  } | null>(null);

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
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            Comparison Report
          </h1>
          <p className="text-muted-foreground">
            Compare your actual herd performance against Fibonacci-based projections.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Forms */}
          <div className="lg:col-span-1 space-y-6">
            <HerdInputForm onSubmit={handleGenerateProjection} />
            
            {projections.length > 0 && config && (
              <ActualDataForm
                maxYear={config.years}
                onAdd={handleAddActual}
                records={actuals}
                onRemove={handleRemoveActual}
              />
            )}
          </div>

          {/* Comparison Results */}
          <div className="lg:col-span-2 space-y-6">
            {projections.length > 0 ? (
              <>
                {/* Chart */}
                <ProjectionChart data={projections} />

                {/* Variance Analysis */}
                {metrics ? (
                  <Card>
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
                            <TrendingUp className="h-6 w-6 text-green-600" />
                          ) : (
                            <TrendingDown className="h-6 w-6 text-red-600" />
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
                        {metrics.variances.map((v) => (
                          <div
                            key={v.year}
                            className="flex items-center justify-between p-3 border rounded-lg"
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
                            <span className={`font-semibold ${v.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {v.variance >= 0 ? '+' : ''}{v.variancePercent}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="py-12">
                      <div className="flex flex-col items-center text-center">
                        <AlertTriangle className="h-12 w-12 text-muted-foreground/40 mb-4" />
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
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-muted/30 rounded-xl border-2 border-dashed border-muted-foreground/20 p-8">
                <div className="text-center space-y-4">
                  <Target className="h-16 w-16 text-muted-foreground/40 mx-auto" />
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
