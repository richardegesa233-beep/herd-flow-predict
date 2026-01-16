import { useState } from "react";
import { HerdInputForm } from "@/components/HerdInputForm";
import { ProjectionTable } from "@/components/ProjectionTable";
import { ProjectionChart } from "@/components/ProjectionChart";
import { ActualDataForm } from "@/components/ActualDataForm";
import { StatCard } from "@/components/StatCard";
import { 
  HerdData, 
  ActualRecord, 
  calculateHerdProjection, 
  calculateWithActuals,
  formatNumber 
} from "@/lib/herdCalculations";
import { Beef, TrendingUp, Baby, Calendar, Target, Sparkles } from "lucide-react";

const Index = () => {
  const [projections, setProjections] = useState<HerdData[]>([]);
  const [actuals, setActuals] = useState<ActualRecord[]>([]);
  const [config, setConfig] = useState<{
    adults: number;
    young: number;
    years: number;
    birthRate: number;
    mortalityRate: number;
  } | null>(null);

  const handleGenerateProjection = (data: {
    adults: number;
    young: number;
    years: number;
    birthRate: number;
    mortalityRate: number;
  }) => {
    const results = calculateHerdProjection(
      data.adults,
      data.young,
      data.years,
      data.birthRate,
      data.mortalityRate
    );
    setProjections(results);
    setConfig(data);
    setActuals([]);
  };

  const handleAddActual = (record: ActualRecord) => {
    const newActuals = [...actuals, record];
    setActuals(newActuals);
    if (projections.length > 0) {
      const updated = calculateWithActuals(projections, newActuals);
      setProjections(updated);
    }
  };

  const handleRemoveActual = (year: number) => {
    const newActuals = actuals.filter(a => a.year !== year);
    setActuals(newActuals);
    if (config) {
      const baseProjections = calculateHerdProjection(
        config.adults,
        config.young,
        config.years,
        config.birthRate,
        config.mortalityRate
      );
      const updated = calculateWithActuals(baseProjections, newActuals);
      setProjections(updated);
    }
  };

  const finalData = projections[projections.length - 1];
  const initialData = projections[0];
  const growthPercent = initialData && finalData 
    ? ((finalData.total - initialData.total) / initialData.total * 100).toFixed(1)
    : "0";

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="gradient-hero text-primary-foreground py-16 px-4">
        <div className="container max-w-6xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Beef className="h-12 w-12 animate-pulse-gentle" />
            <Sparkles className="h-6 w-6 opacity-75" />
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-center mb-4">
            Cattle Herd Growth Predictor
          </h1>
          <p className="text-center text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
            Fibonacci-based projection model for accurate herd growth forecasting.
            Plan your farm's future with data-driven insights.
          </p>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Stats Summary */}
        {projections.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Starting Herd"
              value={formatNumber(initialData?.total || 0)}
              subtitle="Total cattle"
              icon={Beef}
              variant="primary"
              delay={0}
            />
            <StatCard
              title="Final Projection"
              value={formatNumber(finalData?.total || 0)}
              subtitle={`Year ${config?.years || 0}`}
              icon={Target}
              variant="accent"
              delay={100}
            />
            <StatCard
              title="Total Growth"
              value={`${growthPercent}%`}
              subtitle="Over projection period"
              icon={TrendingUp}
              variant="primary"
              delay={200}
            />
            <StatCard
              title="Projection Years"
              value={config?.years || 0}
              subtitle="Planning horizon"
              icon={Calendar}
              variant="muted"
              delay={300}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Form */}
          <div className="lg:col-span-1 space-y-6">
            <HerdInputForm onSubmit={handleGenerateProjection} />
            
            {projections.length > 0 && config && (
              <ActualDataForm
                maxYear={config.years}
                onAdd={handleAddActual}
                records={actuals}
                onRemove={handleRemoveActual}
              />
            )}
          </div>

          {/* Results */}
          <div className="lg:col-span-2 space-y-6">
            {projections.length > 0 ? (
              <>
                <ProjectionChart data={projections} />
                <ProjectionTable data={projections} />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-muted/30 rounded-xl border-2 border-dashed border-muted-foreground/20 p-8">
                <div className="text-center space-y-4">
                  <div className="flex justify-center gap-2">
                    <Beef className="h-16 w-16 text-muted-foreground/40" />
                    <Baby className="h-12 w-12 text-muted-foreground/30 mt-4" />
                  </div>
                  <h3 className="text-2xl font-display font-semibold text-muted-foreground">
                    Ready to Project Your Herd Growth?
                  </h3>
                  <p className="text-muted-foreground max-w-md">
                    Enter your current herd details in the form to generate 
                    Fibonacci-based growth projections for your cattle operation.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info Section */}
        <section className="bg-secondary/50 rounded-2xl p-8 mt-12">
          <h2 className="text-2xl font-display font-bold mb-4 text-center">
            How the Fibonacci Model Works
          </h2>
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div className="space-y-2">
              <h3 className="font-semibold text-primary">Natural Growth Pattern</h3>
              <p className="text-muted-foreground">
                Like the famous Fibonacci sequence, cattle herds grow in a pattern where 
                adult cows produce calves, and those calves mature to become productive adults.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-primary">2-Year Maturation</h3>
              <p className="text-muted-foreground">
                Calves typically take 2 years to reach breeding age. This delay creates 
                the characteristic wave-like growth similar to Fibonacci numbers.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-primary">Realistic Factors</h3>
              <p className="text-muted-foreground">
                The model accounts for birth rates and mortality, providing a realistic 
                projection that helps farmers and managers plan for the future.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-muted/50 py-8 mt-12">
        <div className="container max-w-6xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Cattle Herd Growth Predictor • Fibonacci-based projection model</p>
          <p className="mt-1">For farmers, farm managers, and agricultural students</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
