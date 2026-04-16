import { useMemo } from "react";
import { Layout } from "@/components/Layout";
import { ProjectionChart } from "@/components/ProjectionChart";
import { VarianceTable } from "@/components/VarianceTable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  HerdData,
  ActualRecord,
  calculateHerdProjection,
  calculateWithActuals,
  calculateMAE,
  calculateMAPE,
  calculateRMSE,
  calculateBias,
} from "@/lib/herdCalculations";
import { BarChart3, TrendingUp, TrendingDown, Activity, Percent, Sigma, ArrowUpDown, Info } from "lucide-react";

// Self-contained sample data — no localStorage dependencies
const SAMPLE_PROJECTIONS = calculateHerdProjection(60, 25, 8, 0.85, 0.05, 2, 0.10, 0.50, 4);

const SAMPLE_ACTUALS: ActualRecord[] = [
  { year: 1, births: 48, deaths: 4, sales: 6 },
  { year: 2, births: 52, deaths: 5, sales: 8 },
  { year: 3, births: 55, deaths: 3, sales: 7 },
  { year: 4, births: 50, deaths: 6, sales: 5 },
  { year: 5, births: 58, deaths: 4, sales: 9 },
];

const DemoComparison = () => {
  const projections = useMemo(
    () => calculateWithActuals(SAMPLE_PROJECTIONS, SAMPLE_ACTUALS),
    []
  );

  const metrics = useMemo(() => {
    const yearsWithActuals = projections.filter(p => p.actualTotal !== undefined);
    if (!yearsWithActuals.length) return null;

    const totalProjected = yearsWithActuals.reduce((s, p) => s + p.total, 0);
    const totalActual = yearsWithActuals.reduce((s, p) => s + p.actualTotal!, 0);
    const avgVariance = ((totalActual - totalProjected) / totalProjected * 100).toFixed(1);

    return { avgVariance, isPositive: totalActual >= totalProjected, count: yearsWithActuals.length };
  }, [projections]);

  const mae = calculateMAE(projections);
  const mape = calculateMAPE(projections);
  const rmse = calculateRMSE(projections);
  const bias = calculateBias(projections);

  return (
    <Layout>
      <div className="container max-w-6xl mx-auto px-4 py-8">
        {/* Demo Banner */}
        <Card className="mb-6 border-chart-males/30 bg-chart-males/5">
          <CardContent className="flex items-start gap-3 py-4">
            <Info className="h-5 w-5 text-chart-males mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-foreground">Demo: Comparison Report (Standalone)</p>
              <p className="text-sm text-muted-foreground">
                This demo uses embedded sample projections (60 cows, 8 years) and 5 years of actual data.
                Everything is self-contained — no login, no localStorage, no other sections needed.
              </p>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline">Member 3</Badge>
                <Badge variant="secondary">Statistical Analysis</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">Comparison Report</h1>
          <p className="text-muted-foreground">Projected vs actual herd performance with accuracy metrics.</p>
        </div>

        <div className="space-y-6">
          {/* Chart */}
          <ProjectionChart data={projections} />

          {/* Accuracy Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {mae !== null && (
              <Card>
                <CardHeader className="pb-2"><CardDescription className="flex items-center gap-2"><Activity className="h-4 w-4 text-primary" />MAE</CardDescription></CardHeader>
                <CardContent>
                  <p className="text-2xl font-display font-bold text-primary">{mae.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Avg deviation in head count</p>
                </CardContent>
              </Card>
            )}
            {mape !== null && (
              <Card>
                <CardHeader className="pb-2"><CardDescription className="flex items-center gap-2"><Percent className="h-4 w-4 text-accent" />MAPE</CardDescription></CardHeader>
                <CardContent>
                  <p className={`text-2xl font-display font-bold ${mape < 10 ? 'text-primary' : mape < 25 ? 'text-amber-600' : 'text-destructive'}`}>{mape.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground mt-1">{mape < 10 ? 'Excellent accuracy' : mape < 25 ? 'Moderate accuracy' : 'Review parameters'}</p>
                </CardContent>
              </Card>
            )}
            {rmse !== null && (
              <Card>
                <CardHeader className="pb-2"><CardDescription className="flex items-center gap-2"><Sigma className="h-4 w-4 text-primary" />RMSE</CardDescription></CardHeader>
                <CardContent>
                  <p className="text-2xl font-display font-bold text-primary">{rmse.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Penalises large errors more</p>
                </CardContent>
              </Card>
            )}
            {bias !== null && (
              <Card>
                <CardHeader className="pb-2"><CardDescription className="flex items-center gap-2"><ArrowUpDown className="h-4 w-4 text-accent" />Bias</CardDescription></CardHeader>
                <CardContent>
                  <p className={`text-2xl font-display font-bold ${bias > 0 ? 'text-amber-600' : 'text-primary'}`}>{bias > 0 ? '+' : ''}{bias.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground mt-1">{bias > 0 ? 'Over-projecting' : bias < 0 ? 'Under-projecting' : 'No bias'}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Variance Summary */}
          {metrics && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" />Variance Summary</CardTitle>
                <CardDescription>Overall performance comparison</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${metrics.isPositive ? 'bg-primary/10' : 'bg-destructive/10'}`}>
                      {metrics.isPositive ? <TrendingUp className="h-6 w-6 text-primary" /> : <TrendingDown className="h-6 w-6 text-destructive" />}
                    </div>
                    <div>
                      <p className="font-medium">Average Variance</p>
                      <p className="text-sm text-muted-foreground">Across {metrics.count} recorded years</p>
                    </div>
                  </div>
                  <Badge variant={metrics.isPositive ? "default" : "destructive"} className="text-lg px-4 py-1">
                    {metrics.isPositive ? '+' : ''}{metrics.avgVariance}%
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Variance Table */}
          <VarianceTable data={projections} />
        </div>
      </div>
    </Layout>
  );
};

export default DemoComparison;
