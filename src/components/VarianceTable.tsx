import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { TableIcon, TrendingUp, TrendingDown, Minus, Maximize2, Minimize2 } from "lucide-react";

interface VarianceTableProps {
  data: HerdData[];
}

export function VarianceTable({ data }: VarianceTableProps) {
  const [expanded, setExpanded] = useState(false);

  if (data.length === 0) return null;

  const hasActuals = data.some(d => d.actualTotal !== undefined);

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-display flex items-center gap-2">
              <TableIcon className="h-5 w-5 text-primary" />
              Detailed Variance Analysis — All Years
            </CardTitle>
            <CardDescription>
              Full year-by-year breakdown of projected vs actual herd performance
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 shrink-0"
            onClick={() => setExpanded(e => !e)}
          >
            {expanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            {expanded ? "Collapse" : "Full Table"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className={`rounded-lg border overflow-x-auto transition-all duration-300 ${expanded ? "" : "max-h-[420px] overflow-y-auto"}`}>
          <Table>
            <TableHeader className="sticky top-0 z-10">
              <TableRow className="bg-muted/90 backdrop-blur-sm">
                <TableHead className="font-semibold">Year</TableHead>
                <TableHead className="font-semibold text-right">♀ Breeders</TableHead>
                <TableHead className="font-semibold text-right">♂ Bulls</TableHead>
                <TableHead className="font-semibold text-right">Young</TableHead>
                <TableHead className="font-semibold text-right">Births</TableHead>
                <TableHead className="font-semibold text-right">Deaths</TableHead>
                <TableHead className="font-semibold text-right">Culled</TableHead>
                <TableHead className="font-semibold text-right">Projected</TableHead>
                {hasActuals && (
                  <>
                    <TableHead className="font-semibold text-right">Actual</TableHead>
                    <TableHead className="font-semibold text-right">Variance</TableHead>
                    <TableHead className="font-semibold text-right">Var %</TableHead>
                  </>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, index) => {
                const hasActual = row.actualTotal !== undefined;
                const variance = hasActual ? row.actualTotal! - row.total : null;
                const variancePct = hasActual && row.total > 0
                  ? ((row.actualTotal! - row.total) / row.total * 100)
                  : null;

                return (
                  <TableRow
                    key={row.year}
                    className={`hover:bg-muted/30 transition-colors ${hasActual ? 'bg-primary/[0.03]' : ''}`}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant={hasActual ? "default" : "secondary"}>
                          Year {row.year}
                        </Badge>
                        {hasActual && (
                          <span className="text-[10px] font-medium text-primary uppercase tracking-wider">
                            recorded
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium text-primary">
                      {formatNumber(row.adults)}
                    </TableCell>
                    <TableCell className="text-right font-medium text-chart-males">
                      {formatNumber(row.maleAdults ?? 0)}
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
                    <TableCell className="text-right">
                      <span className="text-warning">-{formatNumber(row.culled)}</span>
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {formatNumber(row.total)}
                    </TableCell>
                    {hasActuals && (
                      <>
                        <TableCell className="text-right font-bold">
                          {hasActual ? (
                            <span className="text-accent">{formatNumber(row.actualTotal!)}</span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {variance !== null ? (
                            <span className={`font-semibold flex items-center justify-end gap-1 ${
                              variance > 0 ? 'text-primary' : variance < 0 ? 'text-destructive' : 'text-muted-foreground'
                            }`}>
                              {variance > 0 ? <TrendingUp className="h-3 w-3" /> : variance < 0 ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                              {variance > 0 ? '+' : ''}{formatNumber(variance)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {variancePct !== null ? (
                            <Badge
                              variant={Math.abs(variancePct) < 5 ? "default" : Math.abs(variancePct) < 15 ? "secondary" : "destructive"}
                              className="text-xs"
                            >
                              {variancePct > 0 ? '+' : ''}{variancePct.toFixed(1)}%
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        {hasActuals && (
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary" /> Within 5% — Excellent
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-secondary" /> 5–15% — Moderate
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-destructive" /> &gt;15% — Review needed
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
