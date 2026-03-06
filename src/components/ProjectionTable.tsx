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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TableIcon, TrendingUp, TrendingDown, Maximize2, X } from "lucide-react";

interface ProjectionTableProps {
  data: HerdData[];
}

function TableContent({ data }: { data: HerdData[] }) {
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
    <Table>
      <TableHeader className="sticky top-0 z-10">
        <TableRow className="bg-muted/90 backdrop-blur-sm">
          <TableHead className="font-semibold">Year</TableHead>
          <TableHead className="font-semibold text-right">♀ Breeders</TableHead>
          <TableHead className="font-semibold text-right">♂ Bulls</TableHead>
          <TableHead className="font-semibold text-right">♀ Young</TableHead>
          <TableHead className="font-semibold text-right">♂ Young</TableHead>
          <TableHead className="font-semibold text-right">♀ Births</TableHead>
          <TableHead className="font-semibold text-right">♂ Births</TableHead>
          <TableHead className="font-semibold text-right">Deaths</TableHead>
          <TableHead className="font-semibold text-right">Culled</TableHead>
          <TableHead className="font-semibold text-right">♂ Bulls Sold</TableHead>
          <TableHead className="font-semibold text-right">Total</TableHead>
          <TableHead className="font-semibold text-right">Growth</TableHead>
          {data.some(d => d.actualTotal !== undefined) && (
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
            <TableCell className="text-right font-medium text-primary">
              {formatNumber(row.adults)}
            </TableCell>
            <TableCell className="text-right font-medium text-chart-males">
              {formatNumber(row.maleAdults ?? 0)}
            </TableCell>
            <TableCell className="text-right font-medium text-chart-secondary">
              {formatNumber(row.young - (row.males ?? 0))}
            </TableCell>
            <TableCell className="text-right font-medium text-chart-males">
              {formatNumber(row.males ?? 0)}
            </TableCell>
            <TableCell className="text-right">
              <span className="text-primary">+{formatNumber(row.femaleBirths)}</span>
            </TableCell>
            <TableCell className="text-right">
              <span className="text-chart-males">+{formatNumber(row.maleBirths)}</span>
            </TableCell>
            <TableCell className="text-right">
              <span className="text-destructive">-{formatNumber(row.deaths)}</span>
            </TableCell>
            <TableCell className="text-right">
              <span className="text-warning">-{formatNumber(row.culled)}</span>
            </TableCell>
            <TableCell className="text-right">
              <span className="text-muted-foreground">-{formatNumber(row.bullsSold)}</span>
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
  );
}

export function ProjectionTable({ data }: ProjectionTableProps) {
  const [fullScreen, setFullScreen] = useState(false);

  if (data.length === 0) return null;

  return (
    <>
      <Card className="shadow-card animate-slide-up">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-display flex items-center gap-2">
                <TableIcon className="h-5 w-5 text-primary" />
                Year-by-Year Projection
              </CardTitle>
              <CardDescription>
                Detailed breakdown of your herd growth over time
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 shrink-0"
              onClick={() => setFullScreen(true)}
            >
              <Maximize2 className="h-4 w-4" />
              Full Table
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-x-auto w-full max-h-[420px] overflow-y-auto">
            <TableContent data={data} />
          </div>
        </CardContent>
      </Card>

      <Dialog open={fullScreen} onOpenChange={setFullScreen}>
        <DialogContent className="max-w-[98vw] w-[98vw] h-[95vh] max-h-[95vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-6 py-4 border-b border-border shrink-0 flex flex-row items-center justify-between">
            <DialogTitle className="text-xl font-display flex items-center gap-2">
              <TableIcon className="h-5 w-5 text-primary" />
              Year-by-Year Projection — Full View
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={() => setFullScreen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </DialogHeader>
          <div className="flex-1 overflow-auto px-4 pb-4">
            <div className="rounded-lg border overflow-x-auto mt-4">
              <TableContent data={data} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
