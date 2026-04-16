import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { ActualRecord } from "@/lib/herdCalculations";
import {
  BookOpen, PlusCircle, Calendar, Pencil, Check, X,
  Eraser, AlertTriangle, Activity, HeartPulse, DollarSign, Baby,
} from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

const MAX_YEAR = 20;
const MAX_COUNT = 500;

type ValidationErrors = {
  births?: string;
  deaths?: string;
  sales?: string;
};

function validate(births: number, deaths: number, sales: number): ValidationErrors {
  const errors: ValidationErrors = {};
  if (births < 0) errors.births = "Cannot be negative";
  else if (births > MAX_COUNT) errors.births = `Max ${MAX_COUNT}`;
  if (deaths < 0) errors.deaths = "Cannot be negative";
  else if (deaths > MAX_COUNT) errors.deaths = `Max ${MAX_COUNT}`;
  else if (deaths > births * 3) errors.deaths = "Unrealistic: too high vs births";
  if (sales < 0) errors.sales = "Cannot be negative";
  else if (sales > MAX_COUNT) errors.sales = `Max ${MAX_COUNT}`;
  return errors;
}

function clamp(val: number) {
  return Math.max(0, Math.min(MAX_COUNT, Math.round(val)));
}

const EventLoggingApp = () => {
  const [records, setRecords, clearRecords] = useLocalStorage<ActualRecord[]>("event-records", []);
  const [editingYear, setEditingYear] = useState<number | null>(null);
  const [editValues, setEditValues] = useState({ births: 0, deaths: 0, sales: 0 });
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [editErrors, setEditErrors] = useState<ValidationErrors>({});

  const [year, setYear] = useState<number>(1);
  const [births, setBirths] = useState<number>(0);
  const [deaths, setDeaths] = useState<number>(0);
  const [sales, setSales] = useState<number>(0);

  const usedYears = new Set(records.map(r => r.year));
  const availableYears = Array.from({ length: MAX_YEAR }, (_, i) => i + 1).filter(y => !usedYears.has(y));

  const handleAdd = () => {
    const b = clamp(births);
    const d = clamp(deaths);
    const s = clamp(sales);
    const errs = validate(b, d, s);
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast.error("Fix validation errors before adding.");
      return;
    }
    if (!availableYears.includes(year)) return;
    setRecords(prev => [...prev, { year, births: b, deaths: d, sales: s }]);
    setBirths(0); setDeaths(0); setSales(0); setErrors({});
    toast.success(`Year ${year} logged successfully`);
  };

  const handleRemove = (y: number) => {
    setRecords(prev => prev.filter(r => r.year !== y));
    toast.success(`Year ${y} deleted`);
  };

  const startEdit = (r: ActualRecord) => {
    setEditingYear(r.year);
    setEditValues({ births: r.births, deaths: r.deaths, sales: r.sales });
    setEditErrors({});
  };

  const confirmEdit = () => {
    if (editingYear === null) return;
    const b = clamp(editValues.births);
    const d = clamp(editValues.deaths);
    const s = clamp(editValues.sales);
    const errs = validate(b, d, s);
    setEditErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast.error("Fix errors before saving.");
      return;
    }
    setRecords(prev => prev.map(r => r.year === editingYear ? { year: editingYear, births: b, deaths: d, sales: s } : r));
    toast.success(`Year ${editingYear} updated`);
    setEditingYear(null);
    setEditErrors({});
  };

  const cancelEdit = () => { setEditingYear(null); setEditErrors({}); };

  const handleClearAll = () => {
    clearRecords();
    setBirths(0); setDeaths(0); setSales(0); setErrors({});
    setShowClearDialog(false);
    toast.success("Ledger cleared");
  };

  const totalBirths = records.reduce((s, r) => s + r.births, 0);
  const totalDeaths = records.reduce((s, r) => s + r.deaths, 0);
  const totalSales = records.reduce((s, r) => s + r.sales, 0);
  const netChange = totalBirths - totalDeaths - totalSales;
  const sorted = [...records].sort((a, b) => a.year - b.year);

  const hasError = Object.keys(errors).length > 0;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Minimal top bar */}
      <div className="border-b border-border bg-background">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-accent" />
            <span className="font-sans text-sm font-semibold tracking-wide uppercase text-foreground">
              Farm Ledger
            </span>
          </div>
          <div className="flex items-center gap-3">
            {records.length > 0 && (
              <button
                onClick={() => setShowClearDialog(true)}
                className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
              >
                <Eraser className="h-3.5 w-3.5" /> Clear ledger
              </button>
            )}
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">
        {/* Entry section */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
            <PlusCircle className="h-4 w-4" /> New Entry
          </h2>

          {availableYears.length > 0 ? (
            <div className="bg-background border border-border rounded-xl p-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Year
                  </Label>
                  <Select value={year.toString()} onValueChange={v => setYear(parseInt(v))}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {availableYears.map(y => (
                        <SelectItem key={y} value={y.toString()}>Yr {y}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Baby className="h-3 w-3" /> Births
                  </Label>
                  <Input
                    type="number" min={0} max={MAX_COUNT} value={births}
                    onChange={e => { const v = parseInt(e.target.value) || 0; setBirths(v); setErrors(prev => { const { births: _, ...rest } = prev; return rest; }); }}
                    className={`h-9 ${errors.births ? 'border-destructive' : ''}`}
                  />
                  {errors.births && <p className="text-[10px] text-destructive flex items-center gap-0.5"><AlertTriangle className="h-2.5 w-2.5" />{errors.births}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <HeartPulse className="h-3 w-3" /> Deaths
                  </Label>
                  <Input
                    type="number" min={0} max={MAX_COUNT} value={deaths}
                    onChange={e => { const v = parseInt(e.target.value) || 0; setDeaths(v); setErrors(prev => { const { deaths: _, ...rest } = prev; return rest; }); }}
                    className={`h-9 ${errors.deaths ? 'border-destructive' : ''}`}
                  />
                  {errors.deaths && <p className="text-[10px] text-destructive flex items-center gap-0.5"><AlertTriangle className="h-2.5 w-2.5" />{errors.deaths}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <DollarSign className="h-3 w-3" /> Sales
                  </Label>
                  <Input
                    type="number" min={0} max={MAX_COUNT} value={sales}
                    onChange={e => { const v = parseInt(e.target.value) || 0; setSales(v); setErrors(prev => { const { sales: _, ...rest } = prev; return rest; }); }}
                    className={`h-9 ${errors.sales ? 'border-destructive' : ''}`}
                  />
                  {errors.sales && <p className="text-[10px] text-destructive flex items-center gap-0.5"><AlertTriangle className="h-2.5 w-2.5" />{errors.sales}</p>}
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button onClick={handleAdd} size="sm" variant="accent" className="gap-1.5 px-6">
                  <PlusCircle className="h-4 w-4" /> Log Entry
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-background border border-border rounded-xl p-6 text-center text-sm text-muted-foreground">
              All {MAX_YEAR} years recorded — clear the ledger to start fresh.
            </div>
          )}
        </section>

        {/* Stats strip */}
        {records.length > 0 && (
          <section className="grid grid-cols-4 gap-3">
            {[
              { label: "Births", value: totalBirths, icon: Baby, color: "text-primary" },
              { label: "Deaths", value: totalDeaths, icon: HeartPulse, color: "text-destructive" },
              { label: "Sales", value: totalSales, icon: DollarSign, color: "text-accent" },
              { label: "Net", value: netChange, icon: Activity, color: netChange >= 0 ? "text-primary" : "text-destructive" },
            ].map(s => (
              <div key={s.label} className="bg-background border border-border rounded-lg px-4 py-3 text-center">
                <s.icon className={`h-4 w-4 mx-auto mb-1 ${s.color}`} />
                <p className={`text-lg font-bold tabular-nums ${s.color}`}>
                  {s.label === "Net" ? (s.value >= 0 ? "+" : "") : (s.label === "Deaths" ? "−" : "+")}{Math.abs(s.value)}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </section>
        )}

        {/* Table */}
        {records.length > 0 ? (
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
              <BookOpen className="h-4 w-4" /> Ledger ({records.length} entries)
            </h2>
            <div className="bg-background border border-border rounded-xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-20 text-xs">Year</TableHead>
                    <TableHead className="text-xs">Births</TableHead>
                    <TableHead className="text-xs">Deaths</TableHead>
                    <TableHead className="text-xs">Sales</TableHead>
                    <TableHead className="text-xs text-right">Net</TableHead>
                    <TableHead className="w-24 text-xs text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sorted.map(record => {
                    const net = record.births - record.deaths - record.sales;
                    const isEditing = editingYear === record.year;
                    return (
                      <TableRow key={record.year} className="group">
                        <TableCell className="font-mono text-xs font-medium">{record.year}</TableCell>
                        {isEditing ? (
                          <>
                            <TableCell>
                              <Input type="number" min={0} max={MAX_COUNT} value={editValues.births}
                                onChange={e => setEditValues(v => ({ ...v, births: parseInt(e.target.value) || 0 }))}
                                className={`h-7 w-20 text-xs ${editErrors.births ? 'border-destructive' : ''}`} />
                              {editErrors.births && <p className="text-[9px] text-destructive mt-0.5">{editErrors.births}</p>}
                            </TableCell>
                            <TableCell>
                              <Input type="number" min={0} max={MAX_COUNT} value={editValues.deaths}
                                onChange={e => setEditValues(v => ({ ...v, deaths: parseInt(e.target.value) || 0 }))}
                                className={`h-7 w-20 text-xs ${editErrors.deaths ? 'border-destructive' : ''}`} />
                              {editErrors.deaths && <p className="text-[9px] text-destructive mt-0.5">{editErrors.deaths}</p>}
                            </TableCell>
                            <TableCell>
                              <Input type="number" min={0} max={MAX_COUNT} value={editValues.sales}
                                onChange={e => setEditValues(v => ({ ...v, sales: parseInt(e.target.value) || 0 }))}
                                className={`h-7 w-20 text-xs ${editErrors.sales ? 'border-destructive' : ''}`} />
                              {editErrors.sales && <p className="text-[9px] text-destructive mt-0.5">{editErrors.sales}</p>}
                            </TableCell>
                            <TableCell className="text-right">—</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={confirmEdit}>
                                  <Check className="h-3.5 w-3.5 text-primary" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={cancelEdit}>
                                  <X className="h-3.5 w-3.5 text-muted-foreground" />
                                </Button>
                              </div>
                            </TableCell>
                          </>
                        ) : (
                          <>
                            <TableCell className="text-primary font-medium">{record.births}</TableCell>
                            <TableCell className="text-destructive font-medium">{record.deaths}</TableCell>
                            <TableCell className="text-accent font-medium">{record.sales}</TableCell>
                            <TableCell className={`text-right font-bold tabular-nums ${net >= 0 ? 'text-primary' : 'text-destructive'}`}>
                              {net >= 0 ? '+' : ''}{net}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => startEdit(record)}>
                                  <Pencil className="h-3 w-3" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-7 w-7 hover:text-destructive" onClick={() => handleRemove(record.year)}>
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    );
                  })}
                  {/* Totals row */}
                  <TableRow className="bg-muted/30 font-semibold border-t-2 border-border">
                    <TableCell className="text-xs uppercase text-muted-foreground">Total</TableCell>
                    <TableCell className="text-primary">{totalBirths}</TableCell>
                    <TableCell className="text-destructive">{totalDeaths}</TableCell>
                    <TableCell className="text-accent">{totalSales}</TableCell>
                    <TableCell className={`text-right font-bold ${netChange >= 0 ? 'text-primary' : 'text-destructive'}`}>
                      {netChange >= 0 ? '+' : ''}{netChange}
                    </TableCell>
                    <TableCell />
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </section>
        ) : (
          <section className="text-center py-16 space-y-6">
            <Activity className="h-14 w-14 mx-auto text-border mb-2" />
            <div>
              <p className="text-foreground font-semibold text-base mb-1">Your ledger is empty</p>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">Start tracking your herd events by logging yearly records above.</p>
            </div>
            <div className="bg-background border border-dashed border-border rounded-xl p-5 max-w-lg mx-auto text-left space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5" /> How to use
              </p>
              <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                <li><span className="text-foreground font-medium">Select a year</span> from the dropdown (1–20)</li>
                <li>Enter <span className="text-primary font-medium">births</span>, <span className="text-destructive font-medium">deaths</span>, and <span className="text-accent font-medium">sales</span> counts (0–500)</li>
                <li>Click <span className="text-foreground font-medium">"Log Entry"</span> to save the record</li>
                <li>Hover any row to <span className="text-foreground font-medium">edit</span> or <span className="text-foreground font-medium">delete</span> it</li>
              </ol>
            </div>
          </section>
        )}
      </div>

      {/* Clear confirmation */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Erase entire ledger?</AlertDialogTitle>
            <AlertDialogDescription>
              All {records.length} entries will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearAll}>Erase All</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EventLoggingApp;
