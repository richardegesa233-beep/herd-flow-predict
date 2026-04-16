import { useState } from "react";
import { Layout } from "@/components/Layout";
import { ActualDataForm } from "@/components/ActualDataForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ActualRecord } from "@/lib/herdCalculations";
import { ClipboardList, History, TrendingUp, TrendingDown, ArrowUpRight, Plus, Trash2, Pencil, Check, X, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

// Pre-loaded sample events
const SAMPLE_RECORDS: ActualRecord[] = [
  { year: 1, births: 48, deaths: 4, sales: 6 },
  { year: 2, births: 52, deaths: 5, sales: 8 },
  { year: 3, births: 55, deaths: 3, sales: 7 },
  { year: 4, births: 50, deaths: 6, sales: 5 },
];

const DemoEvents = () => {
  const [records, setRecords] = useState<ActualRecord[]>(SAMPLE_RECORDS);
  const [editingYear, setEditingYear] = useState<number | null>(null);
  const [editValues, setEditValues] = useState({ births: 0, deaths: 0, sales: 0 });

  const handleAddRecord = (record: ActualRecord) => {
    setRecords(prev => [...prev, record]);
    toast.success(`Year ${record.year} recorded.`);
  };

  const handleRemoveRecord = (year: number) => {
    setRecords(prev => prev.filter(r => r.year !== year));
    toast.success(`Year ${year} removed.`);
  };

  const handleUpdateRecord = (record: ActualRecord) => {
    setRecords(prev => prev.map(r => r.year === record.year ? record : r));
    toast.success(`Year ${record.year} updated.`);
  };

  const startEdit = (record: ActualRecord) => {
    setEditingYear(record.year);
    setEditValues({ births: record.births, deaths: record.deaths, sales: record.sales });
  };

  const confirmEdit = () => {
    if (editingYear !== null) {
      handleUpdateRecord({ year: editingYear, ...editValues });
      setEditingYear(null);
    }
  };

  const cancelEdit = () => setEditingYear(null);

  const totalBirths = records.reduce((sum, r) => sum + r.births, 0);
  const totalDeaths = records.reduce((sum, r) => sum + r.deaths, 0);
  const totalSales = records.reduce((sum, r) => sum + r.sales, 0);
  const netChange = totalBirths - totalDeaths - totalSales;

  return (
    <Layout>
      <div className="container max-w-7xl mx-auto px-4 py-8">
        {/* Demo Banner */}
        <Card className="mb-6 border-accent/30 bg-accent/5">
          <CardContent className="flex items-start gap-3 py-4">
            <Info className="h-5 w-5 text-accent mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-foreground">Demo: Event Logging (Standalone)</p>
              <p className="text-sm text-muted-foreground">
                This demo runs independently with 4 sample years of births, deaths, and sales data.
                Add, edit, or remove records freely. No login or other sections required.
              </p>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline">Member 2</Badge>
                <Badge variant="secondary">CRUD Operations</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">Event Logging</h1>
            <p className="text-muted-foreground">Record actual herd events — births, deaths, and sales.</p>
          </div>
          {records.length > 0 && (
            <Button variant="ghost" size="sm" className="gap-2" onClick={() => { setRecords([]); toast.success("Cleared."); }}>
              <Trash2 className="h-4 w-4" /> Clear All
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-1">
            <ActualDataForm maxYear={20} onAdd={handleAddRecord} records={records} onRemove={handleRemoveRecord} onUpdate={handleUpdateRecord} />
          </div>

          {/* Summary + History */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2"><CardDescription className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" />Total Births</CardDescription></CardHeader>
                <CardContent><p className="text-3xl font-display font-bold text-primary">+{totalBirths}</p></CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardDescription className="flex items-center gap-2"><TrendingDown className="h-4 w-4 text-destructive" />Total Deaths</CardDescription></CardHeader>
                <CardContent><p className="text-3xl font-display font-bold text-destructive">-{totalDeaths}</p></CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardDescription className="flex items-center gap-2"><ArrowUpRight className="h-4 w-4 text-amber-600" />Total Sales</CardDescription></CardHeader>
                <CardContent><p className="text-3xl font-display font-bold text-amber-600">↗{totalSales}</p></CardContent>
              </Card>
              <Card className="sm:col-span-3">
                <CardHeader className="pb-2"><CardDescription className="flex items-center gap-2"><Plus className="h-4 w-4" />Net Change</CardDescription></CardHeader>
                <CardContent><p className={`text-3xl font-display font-bold ${netChange >= 0 ? 'text-primary' : 'text-destructive'}`}>{netChange >= 0 ? '+' : ''}{netChange}</p></CardContent>
              </Card>
            </div>

            {/* History list */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><History className="h-5 w-5" />Event History</CardTitle>
                <CardDescription>All recorded events sorted by year</CardDescription>
              </CardHeader>
              <CardContent>
                {records.length > 0 ? (
                  <div className="space-y-3">
                    {[...records].sort((a, b) => a.year - b.year).map((record) => (
                      <div key={record.year} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        {editingYear === record.year ? (
                          <>
                            <div className="flex items-center gap-3 flex-1">
                              <Badge variant="outline" className="font-mono">Year {record.year}</Badge>
                              <div className="flex gap-2 items-center text-sm">
                                <div className="flex items-center gap-1"><span className="text-primary text-xs">Births:</span><Input type="number" min={0} value={editValues.births} onChange={(e) => setEditValues(v => ({ ...v, births: parseInt(e.target.value) || 0 }))} className="h-7 w-16 px-1.5 text-xs" /></div>
                                <div className="flex items-center gap-1"><span className="text-destructive text-xs">Deaths:</span><Input type="number" min={0} value={editValues.deaths} onChange={(e) => setEditValues(v => ({ ...v, deaths: parseInt(e.target.value) || 0 }))} className="h-7 w-16 px-1.5 text-xs" /></div>
                                <div className="flex items-center gap-1"><span className="text-amber-600 text-xs">Sales:</span><Input type="number" min={0} value={editValues.sales} onChange={(e) => setEditValues(v => ({ ...v, sales: parseInt(e.target.value) || 0 }))} className="h-7 w-16 px-1.5 text-xs" /></div>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={confirmEdit}><Check className="h-4 w-4 text-primary" /></Button>
                              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={cancelEdit}><X className="h-4 w-4 text-destructive" /></Button>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center gap-4">
                              <Badge variant="outline" className="font-mono">Year {record.year}</Badge>
                              <div className="flex gap-4 text-sm">
                                <span className="text-primary font-medium">+{record.births} births</span>
                                <span className="text-destructive font-medium">-{record.deaths} deaths</span>
                                {record.sales > 0 && <span className="text-amber-600 font-medium">↗{record.sales} sales</span>}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={record.births - record.deaths - record.sales >= 0 ? "default" : "destructive"}>
                                Net: {record.births - record.deaths - record.sales >= 0 ? '+' : ''}{record.births - record.deaths - record.sales}
                              </Badge>
                              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => startEdit(record)}><Pencil className="h-3.5 w-3.5" /></Button>
                              <Button size="icon" variant="ghost" className="h-7 w-7 hover:text-destructive" onClick={() => handleRemoveRecord(record.year)}><Trash2 className="h-3.5 w-3.5" /></Button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <ClipboardList className="h-12 w-12 text-muted-foreground/40 mb-4" />
                    <h3 className="font-semibold text-lg text-muted-foreground mb-2">No Events Recorded</h3>
                    <p className="text-sm text-muted-foreground max-w-sm">Use the form to log births, deaths, and sales.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DemoEvents;
