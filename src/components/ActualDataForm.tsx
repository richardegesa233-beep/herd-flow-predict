import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ActualRecord } from "@/lib/herdCalculations";
import { ClipboardList, Plus, Trash2, Pencil, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ActualDataFormProps {
  maxYear: number;
  onAdd: (record: ActualRecord) => void;
  records: ActualRecord[];
  onRemove: (year: number) => void;
  onUpdate?: (record: ActualRecord) => void;
}

export function ActualDataForm({ maxYear, onAdd, records, onRemove, onUpdate }: ActualDataFormProps) {
  const [year, setYear] = useState<number>(1);
  const [births, setBirths] = useState<number>(0);
  const [deaths, setDeaths] = useState<number>(0);
  const [sales, setSales] = useState<number>(0);
  const [editingYear, setEditingYear] = useState<number | null>(null);
  const [editValues, setEditValues] = useState({ births: 0, deaths: 0, sales: 0 });

  const handleAdd = () => {
    if (year > 0 && year <= maxYear) {
      onAdd({ year, births, deaths, sales });
      setBirths(0);
      setDeaths(0);
      setSales(0);
    }
  };

  const startEdit = (record: ActualRecord) => {
    setEditingYear(record.year);
    setEditValues({ births: record.births, deaths: record.deaths, sales: record.sales });
  };

  const confirmEdit = () => {
    if (editingYear !== null && onUpdate) {
      onUpdate({ year: editingYear, ...editValues });
      setEditingYear(null);
    }
  };

  const cancelEdit = () => {
    setEditingYear(null);
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
          Enter actual births, deaths, and sales to compare with projections
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {availableYears.length > 0 ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
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
            </div>
            <div className="grid grid-cols-2 gap-3">
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
              <div className="space-y-2">
                <Label>Sales/Culls</Label>
                <Input
                  type="number"
                  min={0}
                  value={sales}
                  onChange={(e) => setSales(parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
            </div>
            <Button onClick={handleAdd} variant="accent" className="w-full">
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
                <div key={record.year}>
                  {editingYear === record.year ? (
                    <div className="flex items-center gap-1 bg-secondary rounded-md px-2 py-1.5 text-sm">
                      <span className="font-semibold mr-1">Y{record.year}:</span>
                      <Input
                        type="number"
                        min={0}
                        value={editValues.births}
                        onChange={(e) => setEditValues(v => ({ ...v, births: parseInt(e.target.value) || 0 }))}
                        className="h-6 w-14 px-1 text-xs"
                      />
                      <Input
                        type="number"
                        min={0}
                        value={editValues.deaths}
                        onChange={(e) => setEditValues(v => ({ ...v, deaths: parseInt(e.target.value) || 0 }))}
                        className="h-6 w-14 px-1 text-xs"
                      />
                      <Input
                        type="number"
                        min={0}
                        value={editValues.sales}
                        onChange={(e) => setEditValues(v => ({ ...v, sales: parseInt(e.target.value) || 0 }))}
                        className="h-6 w-14 px-1 text-xs"
                      />
                      <button onClick={confirmEdit} className="text-green-600 hover:text-green-700">
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={cancelEdit} className="text-destructive hover:opacity-80">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="px-3 py-2 flex items-center gap-2"
                    >
                      <span className="font-semibold">Y{record.year}:</span>
                      <span className="text-primary">+{record.births}</span>
                      <span className="text-destructive">-{record.deaths}</span>
                      {record.sales > 0 && <span className="text-amber-600">↗{record.sales}</span>}
                      <button
                        onClick={() => startEdit(record)}
                        className="ml-1 hover:text-accent transition-colors"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => onRemove(record.year)}
                        className="hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
