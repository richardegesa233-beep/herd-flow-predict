import { HerdData, formatNumber } from "@/lib/herdCalculations";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TableIcon, TrendingUp, TrendingDown } from "lucide-react";

interface ProjectionTableProps {
  data: HerdData[];
}

export function ProjectionTable({ data }: ProjectionTableProps) {
  if (data.length === 0) return null;

  const getGrowthIndicator = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100;
    if (change > 0) {
      return (
        <span className="flex items-center gap-1 text-primary text-sm">
          <TrendingUp className="h-3 w-3" />
          +{change.toFixed(1)}%
        </span>
      );
    } else if (change < 0) {
      return (
        <span className="flex items-center gap-1 text-destructive text-sm">
          <TrendingDown className="h-3 w-3" />
          {change.toFixed(1)}%
        </span>
      );
    }
    return null;
  };

  return (
    <Card className="shadow-card animate-slide-up">
      <CardHeader>
        <CardTitle className="text-xl font-display flex items-center gap-2">
          <TableIcon className="h-5 w-5 text-primary" />
          Year-by-Year Projection
        </CardTitle>
        <CardDescription>
          Detailed breakdown of your herd growth over time
        </CardDescription>
      </CardHeader>
      <CardContent>
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
                {data.some(d => d.actualTotal !== undefined) && (
                  <TableHead className="font-semibold text-right">Actual</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, index) => (
                <TableRow 
                  key={row.year} 
                  className="hover:bg-muted/30 transition-colors"
                >
                  <TableCell>
                    <Badge variant={index === 0 ? "default" : "secondary"}>
                      Year {row.year}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatNumber(row.adults)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatNumber(row.young)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-primary">+{formatNumber(row.births)}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-destructive">-{formatNumber(row.deaths)}</span>
                  </TableCell>
                  <TableCell className="text-right font-bold text-lg">
                    {formatNumber(row.total)}
                  </TableCell>
                  <TableCell className="text-right">
                    {index > 0 && getGrowthIndicator(row.total, data[index - 1].total)}
                  </TableCell>
                  {data.some(d => d.actualTotal !== undefined) && (
                    <TableCell className="text-right">
                      {row.actualTotal !== undefined && (
                        <span className="font-semibold text-accent">
                          {formatNumber(row.actualTotal)}
                        </span>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
