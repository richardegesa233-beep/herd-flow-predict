import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ActualRecord } from "@/lib/herdCalculations";
import { ClipboardList, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ActualDataFormProps {
  maxYear: number;
  onAdd: (record: ActualRecord) => void;
  records: ActualRecord[];
  onRemove: (year: number) => void;
}

export function ActualDataForm({ maxYear, onAdd, records, onRemove }: ActualDataFormProps) {
  const [year, setYear] = useState<number>(1);
  const [births, setBirths] = useState<number>(0);
  const [deaths, setDeaths] = useState<number>(0);

  const handleAdd = () => {
    if (year > 0 && year <= maxYear) {
      onAdd({ year, births, deaths });
      setBirths(0);
      setDeaths(0);
    }
  };

  const availableYears = Array.from({ length: maxYear }, (_, i) => i + 1).filter(
    y => !records.some(r => r.year === y)
  );

  return (
    <Card className="shadow-card animate-fade-in">
      <CardHeader>
        <CardTitle className="text-xl font-display flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-accent" />
          Record Actual Data
        </CardTitle>
        <CardDescription>
          Enter actual births and deaths to compare with projections
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {availableYears.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <Label>Year</Label>
              <Select value={year.toString()} onValueChange={(v) => setYear(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map(y => (
                    <SelectItem key={y} value={y.toString()}>
                      Year {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Births</Label>
              <Input
                type="number"
                min={0}
                value={births}
                onChange={(e) => setBirths(parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label>Deaths</Label>
              <Input
                type="number"
                min={0}
                value={deaths}
                onChange={(e) => setDeaths(parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
            <Button onClick={handleAdd} variant="accent">
              <Plus className="h-4 w-4 mr-1" />
              Add Record
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-2">
            All years have been recorded
          </p>
        )}

        {records.length > 0 && (
          <div className="space-y-2 pt-4 border-t">
            <Label className="text-sm text-muted-foreground">Recorded Data</Label>
            <div className="flex flex-wrap gap-2">
              {records
                .sort((a, b) => a.year - b.year)
                .map(record => (
                <Badge
                  key={record.year}
                  variant="secondary"
                  className="px-3 py-2 flex items-center gap-2"
                >
                  <span className="font-semibold">Year {record.year}:</span>
                  <span className="text-primary">+{record.births}</span>
                  <span className="text-destructive">-{record.deaths}</span>
                  <button
                    onClick={() => onRemove(record.year)}
                    className="ml-1 hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
