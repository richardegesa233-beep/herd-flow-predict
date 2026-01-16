import { HerdData } from "@/lib/herdCalculations";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Line, ComposedChart } from "recharts";
import { LineChart } from "lucide-react";

interface ProjectionChartProps {
  data: HerdData[];
}

export function ProjectionChart({ data }: ProjectionChartProps) {
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
    <Card className="shadow-card animate-slide-up">
      <CardHeader>
        <CardTitle className="text-xl font-display flex items-center gap-2">
          <LineChart className="h-5 w-5 text-primary" />
          Growth Visualization
        </CardTitle>
        <CardDescription>
          Visual representation of your herd growth projection
          {hasActuals && " compared to actual data"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAdults" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(142, 45%, 40%)" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(142, 45%, 40%)" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorYoung" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(25, 55%, 55%)" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(25, 55%, 55%)" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(35, 25%, 88%)" />
              <XAxis 
                dataKey="year" 
                tick={{ fill: 'hsl(30, 10%, 45%)', fontSize: 12 }}
                tickLine={{ stroke: 'hsl(35, 25%, 88%)' }}
              />
              <YAxis 
                tick={{ fill: 'hsl(30, 10%, 45%)', fontSize: 12 }}
                tickLine={{ stroke: 'hsl(35, 25%, 88%)' }}
                tickFormatter={(value) => value.toLocaleString()}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(40, 30%, 100%)',
                  border: '1px solid hsl(35, 25%, 88%)',
                  borderRadius: '0.75rem',
                  boxShadow: '0 4px 6px -1px hsl(30 10% 15% / 0.1)',
                }}
                labelStyle={{ fontWeight: 600, color: 'hsl(30, 10%, 15%)' }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
              />
              <Area
                type="monotone"
                dataKey="Adults"
                stackId="1"
                stroke="hsl(142, 45%, 40%)"
                strokeWidth={2}
                fill="url(#colorAdults)"
                name="Adult Cattle"
              />
              <Area
                type="monotone"
                dataKey="Young"
                stackId="1"
                stroke="hsl(25, 55%, 55%)"
                strokeWidth={2}
                fill="url(#colorYoung)"
                name="Young Cattle"
              />
              {hasActuals && (
                <Line
                  type="monotone"
                  dataKey="Actual"
                  stroke="hsl(200, 50%, 50%)"
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  dot={{ fill: 'hsl(200, 50%, 50%)', strokeWidth: 2, r: 4 }}
                  name="Actual Total"
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
