import { useState } from "react";
import { Layout } from "@/components/Layout";
import { HerdInputForm } from "@/components/HerdInputForm";
import { ProjectionTable } from "@/components/ProjectionTable";
import { ProjectionChart } from "@/components/ProjectionChart";
import { StatCard } from "@/components/StatCard";
import { 
  HerdData, 
  calculateHerdProjection, 
  formatNumber 
} from "@/lib/herdCalculations";
import { Beef, TrendingUp, Target, Calendar } from "lucide-react";

const HerdProjection = () => {
  const [projections, setProjections] = useState<HerdData[]>([]);
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
  };

  const finalData = projections[projections.length - 1];
  const initialData = projections[0];
  const growthPercent = initialData && finalData 
    ? ((finalData.total - initialData.total) / initialData.total * 100).toFixed(1)
    : "0";

  return (
    <Layout>
      <div className="container max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            Herd Projection
          </h1>
          <p className="text-muted-foreground">
            Enter your current herd details to generate Fibonacci-based growth projections.
          </p>
        </div>

        {/* Stats Summary */}
        {projections.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
          <div className="lg:col-span-1">
            <HerdInputForm onSubmit={handleGenerateProjection} />
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
                  <Beef className="h-16 w-16 text-muted-foreground/40 mx-auto" />
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
      </div>
    </Layout>
  );
};

export default HerdProjection;
