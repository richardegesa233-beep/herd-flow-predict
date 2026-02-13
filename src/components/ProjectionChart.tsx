import { useState } from "react";
import { HerdData, formatNumber } from "@/lib/herdCalculations";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Line, ComposedChart } from "recharts";
import { LineChart, TableIcon, TrendingUp, TrendingDown } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProjectionChartProps {
  data: HerdData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl shadow-lg p-4 space-y-2">
      <p className="font-display font-semibold text-foreground text-sm">{label}</p>
      <div className="space-y-1">
        {payload.map((entry: any, i: number) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: entry.color }} />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-semibold text-foreground">{Number(entry.value).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

function GrowthIndicator({ current, previous }: { current: number; previous: number }) {
  const change = ((current - previous) / previous) * 100;
  if (change > 0) {
    return (
      <span className="flex items-center gap-1 text-primary text-sm">
        <TrendingUp className="h-3 w-3" />+{change.toFixed(1)}%
      </span>
    );
  }
  if (change < 0) {
    return (
      <span className="flex items-center gap-1 text-destructive text-sm">
        <TrendingDown className="h-3 w-3" />{change.toFixed(1)}%
      </span>
    );
  }
  return null;
}

export function ProjectionChart({ data }: ProjectionChartProps) {
  const [view, setView] = useState<"chart" | "table">("chart");

  if (data.length === 0) return null;

  const hasActuals = data.some(d => d.actualTotal !== undefined);

  const chartData = data.map(d => ({
    year: `Year ${d.year}`,
    Adults: d.adults,
    Young: d.young,
    Total: d.total,
    Actual: d.actualTotal,
  }));

  return (
    <Card className="shadow-card animate-slide-up overflow-hidden">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="text-xl font-display flex items-center gap-2">
            {view === "chart" ? (
              <LineChart className="h-5 w-5 text-primary" />
            ) : (
              <TableIcon className="h-5 w-5 text-primary" />
            )}
            Growth Visualization
          </CardTitle>
          <CardDescription>
            {view === "chart"
              ? `Visual projection of herd growth${hasActuals ? " vs actual data" : ""}`
              : "Detailed year-by-year breakdown"}
          </CardDescription>
        </div>
        <Tabs value={view} onValueChange={(v) => setView(v as "chart" | "table")}>
          <TabsList className="h-9">
            <TabsTrigger value="chart" className="gap-1.5 text-xs px-3">
              <LineChart className="h-3.5 w-3.5" /> Chart
            </TabsTrigger>
            <TabsTrigger value="table" className="gap-1.5 text-xs px-3">
              <TableIcon className="h-3.5 w-3.5" /> Table
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent>
        {view === "chart" ? (
          <div className="h-[420px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradAdults" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--chart-primary))" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="hsl(var(--chart-primary))" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="gradYoung" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--chart-secondary))" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="hsl(var(--chart-secondary))" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="year"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                />
                <YAxis
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => value.toLocaleString()}
                  width={55}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: '16px', fontSize: '13px' }}
                  iconType="circle"
                  iconSize={8}
                />
                <Area
                  type="monotone"
                  dataKey="Adults"
                  stackId="1"
                  stroke="hsl(var(--chart-primary))"
                  strokeWidth={2.5}
                  fill="url(#gradAdults)"
                  name="Adult Cattle"
                  animationDuration={1200}
                />
                <Area
                  type="monotone"
                  dataKey="Young"
                  stackId="1"
                  stroke="hsl(var(--chart-secondary))"
                  strokeWidth={2.5}
                  fill="url(#gradYoung)"
                  name="Young Cattle"
                  animationDuration={1400}
                />
                {hasActuals && (
                  <Line
                    type="monotone"
                    dataKey="Actual"
                    stroke="hsl(var(--chart-tertiary))"
                    strokeWidth={3}
                    strokeDasharray="6 4"
                    dot={{ fill: 'hsl(var(--chart-tertiary))', strokeWidth: 2, r: 5, stroke: 'hsl(var(--card))' }}
                    activeDot={{ r: 7, strokeWidth: 3 }}
                    name="Actual Total"
                    animationDuration={1600}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Year</TableHead>
                  <TableHead className="font-semibold text-right">Adults</TableHead>
                  <TableHead className="font-semibold text-right">Young</TableHead>
                  <TableHead className="font-semibold text-right">Births</TableHead>
                  <TableHead className="font-semibold text-right">Deaths</TableHead>
                  <TableHead className="font-semibold text-right">Total</TableHead>
                  <TableHead className="font-semibold text-right">Growth</TableHead>
                  {hasActuals && (
                    <TableHead className="font-semibold text-right">Actual</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, index) => (
                  <TableRow key={row.year} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <Badge variant={index === 0 ? "default" : "secondary"}>
                        Year {row.year}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">{formatNumber(row.adults)}</TableCell>
                    <TableCell className="text-right font-medium">{formatNumber(row.young)}</TableCell>
                    <TableCell className="text-right">
                      <span className="text-primary">+{formatNumber(row.births)}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-destructive">-{formatNumber(row.deaths)}</span>
                    </TableCell>
                    <TableCell className="text-right font-bold text-lg">{formatNumber(row.total)}</TableCell>
                    <TableCell className="text-right">
                      {index > 0 && <GrowthIndicator current={row.total} previous={data[index - 1].total} />}
                    </TableCell>
                    {hasActuals && (
                      <TableCell className="text-right">
                        {row.actualTotal !== undefined && (
                          <span className="font-semibold text-accent">{formatNumber(row.actualTotal)}</span>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
