import { useState } from "react";
import { HerdData, formatNumber } from "@/lib/herdCalculations";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, Line, ComposedChart, Bar, ReferenceLine, Brush
} from "recharts";
import { LineChart, TableIcon, TrendingUp, TrendingDown, Maximize2, Minimize2 } from "lucide-react";
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

const DetailedTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl shadow-lg p-5 space-y-3 min-w-[220px]">
      <p className="font-display font-bold text-foreground">{label}</p>
      <div className="space-y-1.5">
        {payload.map((entry: any, i: number) => (
          <div key={i} className="flex items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ background: entry.color }} />
              <span className="text-muted-foreground">{entry.name}</span>
            </div>
            <span className="font-bold text-foreground">{Number(entry.value).toLocaleString()}</span>
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

function FullChart({ data, hasActuals }: { data: any[]; hasActuals: boolean }) {
  const avgTotal = data.reduce((s, d) => s + d.Total, 0) / data.length;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
        <defs>
          <linearGradient id="gradAdultsFull" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--chart-primary))" stopOpacity={0.5} />
            <stop offset="100%" stopColor="hsl(var(--chart-primary))" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="gradYoungFull" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--chart-secondary))" stopOpacity={0.5} />
            <stop offset="100%" stopColor="hsl(var(--chart-secondary))" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} opacity={0.5} />
        <XAxis dataKey="year" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 13 }} tickLine={false} axisLine={{ stroke: 'hsl(var(--border))' }} />
        <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 13 }} tickLine={false} axisLine={false} tickFormatter={(value) => value.toLocaleString()} width={65} />
        <Tooltip content={<DetailedTooltip />} />
        <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '13px' }} iconType="circle" iconSize={10} />
        <ReferenceLine y={avgTotal} stroke="hsl(var(--muted-foreground))" strokeDasharray="8 4" strokeOpacity={0.4} label={{ value: `Avg: ${Math.round(avgTotal).toLocaleString()}`, position: "right", fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
        <Area type="monotone" dataKey="Breeding Females" stackId="1" stroke="hsl(var(--chart-primary))" strokeWidth={2.5} fill="url(#gradAdultsFull)" name="Breeding Females (♀)" animationDuration={1200} />
        <Area type="monotone" dataKey="Female Young" stackId="1" stroke="hsl(var(--chart-secondary))" strokeWidth={2.5} fill="url(#gradYoungFull)" name="Female Young (♀)" animationDuration={1400} />
        <Area type="monotone" dataKey="Young Males" stackId="1" stroke="hsl(var(--chart-males))" strokeWidth={2} fill="hsl(var(--chart-males) / 0.15)" name="Young Males (♂)" animationDuration={1500} />
        <Area type="monotone" dataKey="Adult Bulls" stackId="1" stroke="hsl(var(--chart-tertiary))" strokeWidth={2} fill="hsl(var(--chart-tertiary) / 0.12)" name="Adult Bulls (♂)" animationDuration={1600} />
        <Bar dataKey="Births" fill="hsl(var(--chart-primary))" opacity={0.25} name="Births" animationDuration={1000} barSize={data.length > 15 ? 8 : 14} />
        <Bar dataKey="Deaths" fill="hsl(var(--destructive))" opacity={0.25} name="Deaths" animationDuration={1000} barSize={data.length > 15 ? 8 : 14} />
        {hasActuals && (
          <Line type="monotone" dataKey="Actual" stroke="hsl(var(--chart-tertiary))" strokeWidth={3} strokeDasharray="6 4" dot={{ fill: 'hsl(var(--chart-tertiary))', strokeWidth: 2, r: 5, stroke: 'hsl(var(--card))' }} activeDot={{ r: 7, strokeWidth: 3 }} name="Actual Total" animationDuration={1600} />
        )}
        {data.length > 8 && (
          <Brush dataKey="year" height={24} stroke="hsl(var(--border))" fill="hsl(var(--muted))" travellerWidth={8} />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export function ProjectionChart({ data }: ProjectionChartProps) {
  const [view, setView] = useState<"chart" | "table">("chart");
  const [fullscreen, setFullscreen] = useState(false);

  if (data.length === 0) return null;

  const hasActuals = data.some(d => d.actualTotal !== undefined);

  const chartData = data.map(d => ({
    year: `Year ${d.year}`,
    'Breeding Females': d.adults,
    'Female Young': d.young - (d.males || 0),
    'Young Males': d.males || 0,
    'Adult Bulls': d.maleAdults || 0,
    Total: d.total,
    Births: d.births,
    Deaths: d.deaths,
    Actual: d.actualTotal,
  }));

  return (
    <>
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
          <div className="flex items-center gap-2">
            {view === "chart" && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setFullscreen(true)}
                aria-label="Fullscreen chart"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            )}
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
          </div>
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
                    dataKey="Breeding Females"
                    stackId="1"
                    stroke="hsl(var(--chart-primary))"
                    strokeWidth={2.5}
                    fill="url(#gradAdults)"
                    name="Breeding Females (♀)"
                    animationDuration={1200}
                  />
                  <Area
                    type="monotone"
                    dataKey="Female Young"
                    stackId="1"
                    stroke="hsl(var(--chart-secondary))"
                    strokeWidth={2.5}
                    fill="url(#gradYoung)"
                    name="Female Young (♀)"
                    animationDuration={1400}
                  />
                  <Area
                    type="monotone"
                    dataKey="Young Males"
                    stackId="1"
                    stroke="hsl(var(--chart-males))"
                    strokeWidth={2}
                    fill="hsl(var(--chart-males) / 0.15)"
                    name="Young Males (♂)"
                    animationDuration={1500}
                  />
                  <Area
                    type="monotone"
                    dataKey="Adult Bulls"
                    stackId="1"
                    stroke="hsl(var(--chart-tertiary))"
                    strokeWidth={2}
                    fill="hsl(var(--chart-tertiary) / 0.12)"
                    name="Adult Bulls (♂)"
                    animationDuration={1600}
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
                    <TableHead className="font-semibold text-right">♀ Breeders</TableHead>
                    <TableHead className="font-semibold text-right">♂ Bulls</TableHead>
                    <TableHead className="font-semibold text-right">♀ Young</TableHead>
                    <TableHead className="font-semibold text-right">♂ Young</TableHead>
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
                      <TableCell className="text-right font-medium text-primary">{formatNumber(row.adults)}</TableCell>
                      <TableCell className="text-right font-medium text-chart-males">{formatNumber(row.maleAdults ?? 0)}</TableCell>
                      <TableCell className="text-right font-medium text-chart-secondary">{formatNumber(row.young - (row.males ?? 0))}</TableCell>
                      <TableCell className="text-right font-medium text-chart-males">{formatNumber(row.males ?? 0)}</TableCell>
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

      {/* Fullscreen Detailed Chart Dialog */}
      <Dialog open={fullscreen} onOpenChange={setFullscreen}>
        <DialogContent className="max-w-[95vw] w-full h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-2 flex flex-row items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-display flex items-center gap-2">
                <LineChart className="h-6 w-6 text-primary" />
                Detailed Herd Growth Chart
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Full breakdown with births, deaths, and population trends
                {hasActuals && " vs actual recorded data"}
              </p>
            </div>
          </DialogHeader>
          <div className="flex-1 px-6 pb-6 min-h-0">
            <FullChart data={chartData} hasActuals={hasActuals} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
