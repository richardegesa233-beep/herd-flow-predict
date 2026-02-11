import { useState } from "react";
import { Layout } from "@/components/Layout";
import { ActualDataForm } from "@/components/ActualDataForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ActualRecord } from "@/lib/herdCalculations";
import { ClipboardList, Plus, History, TrendingUp, TrendingDown, ArrowUpRight } from "lucide-react";

const EventLogging = () => {
  const [records, setRecords] = useState<ActualRecord[]>([]);

  const handleAddRecord = (record: ActualRecord) => {
    setRecords(prev => [...prev, record]);
  };

  const handleRemoveRecord = (year: number) => {
    setRecords(prev => prev.filter(r => r.year !== year));
  };

  const totalBirths = records.reduce((sum, r) => sum + r.births, 0);
  const totalDeaths = records.reduce((sum, r) => sum + r.deaths, 0);
  const totalSales = records.reduce((sum, r) => sum + r.sales, 0);
  const netChange = totalBirths - totalDeaths - totalSales;

  return (
    <Layout>
      <div className="container max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            Event Logging
          </h1>
          <p className="text-muted-foreground">
            Record actual births and deaths to track your herd's real performance against projections.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Form */}
          <div className="lg:col-span-1">
            <ActualDataForm
              maxYear={10}
              onAdd={handleAddRecord}
              records={records}
              onRemove={handleRemoveRecord}
            />
          </div>

          {/* Summary & History */}
          <div className="lg:col-span-2 space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    Total Births
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-display font-bold text-green-600">
                    +{totalBirths}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    Total Deaths
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-display font-bold text-red-600">
                    -{totalDeaths}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2">
                    <ArrowUpRight className="h-4 w-4 text-amber-600" />
                    Total Sales
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-display font-bold text-amber-600">
                    ↗{totalSales}
                  </p>
                </CardContent>
              </Card>
              <Card className="sm:col-span-3">
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Net Change (Births − Deaths − Sales)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className={`text-3xl font-display font-bold ${netChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {netChange >= 0 ? '+' : ''}{netChange}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Event History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Event History
                </CardTitle>
                <CardDescription>
                  All recorded farm events sorted by year
                </CardDescription>
              </CardHeader>
              <CardContent>
                {records.length > 0 ? (
                  <div className="space-y-3">
                    {[...records]
                      .sort((a, b) => a.year - b.year)
                      .map((record) => (
                        <div
                          key={record.year}
                          className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                        >
                          <div className="flex items-center gap-4">
                            <Badge variant="outline" className="font-mono">
                              Year {record.year}
                            </Badge>
                            <div className="flex gap-4 text-sm">
                              <span className="text-green-600 font-medium">
                                +{record.births} births
                              </span>
                              <span className="text-red-600 font-medium">
                                -{record.deaths} deaths
                              </span>
                              {record.sales > 0 && (
                                <span className="text-amber-600 font-medium">
                                  ↗{record.sales} sales
                                </span>
                              )}
                            </div>
                          </div>
                          <Badge 
                            variant={record.births - record.deaths - record.sales >= 0 ? "default" : "destructive"}
                          >
                            Net: {record.births - record.deaths - record.sales >= 0 ? '+' : ''}{record.births - record.deaths - record.sales}
                          </Badge>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <ClipboardList className="h-12 w-12 text-muted-foreground/40 mb-4" />
                    <h3 className="font-semibold text-lg text-muted-foreground mb-2">
                      No Events Recorded
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-sm">
                      Start logging births and deaths using the form on the left to track your herd's actual performance.
                    </p>
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

export default EventLogging;
