import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Beef, Baby, Calendar, TrendingUp, Heart, Skull, Scissors } from "lucide-react";

interface HerdInputFormProps {
  onSubmit: (data: {
    femaleAdults: number;
    maleAdults: number;
    young: number;
    years: number;
    birthRate: number;
    mortalityRate: number;
    cullRate: number;
  }) => void;
  initialValues?: {
    femaleAdults?: number;
    maleAdults?: number;
    adults?: number;
    young: number;
    years: number;
    birthRate: number;
    mortalityRate: number;
    cullRate: number;
  } | null;
}

export function HerdInputForm({ onSubmit, initialValues }: HerdInputFormProps) {
  const [femaleAdults, setFemaleAdults] = useState<number>(initialValues?.femaleAdults ?? initialValues?.adults ?? 50);
  const [maleAdults, setMaleAdults] = useState<number>(initialValues?.maleAdults ?? 5);
  const [young, setYoung] = useState<number>(initialValues?.young ?? 20);
  const [years, setYears] = useState<number>(initialValues?.years ?? 10);
  const [birthRate, setBirthRate] = useState<number>(initialValues ? Math.round(initialValues.birthRate * 100) : 85);
  const [mortalityRate, setMortalityRate] = useState<number>(initialValues ? Math.round(initialValues.mortalityRate * 100) : 5);
  const [cullRate, setCullRate] = useState<number>(initialValues ? Math.round(initialValues.cullRate * 100) : 10);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      femaleAdults,
      maleAdults,
      young,
      years,
      birthRate: birthRate / 100,
      mortalityRate: mortalityRate / 100,
      cullRate: cullRate / 100,
    });
  };

  return (
    <Card className="shadow-card hover:shadow-card-hover transition-all duration-300 border-border/50 rounded-2xl overflow-hidden">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-xl flex items-center gap-2.5" style={{ fontFamily: "'Playfair Display', serif" }}>
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Beef className="h-4 w-4 text-primary" />
          </div>
          Configuration
        </CardTitle>
        <CardDescription className="text-xs">
          Enter your current herd details to generate growth projections
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 group">
              <Label htmlFor="femaleAdults" className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Beef className="h-3.5 w-3.5 text-primary" />
                Adult Females
              </Label>
              <Input
                id="femaleAdults"
                type="number"
                min={1}
                max={10000}
                value={femaleAdults}
                onChange={(e) => setFemaleAdults(parseInt(e.target.value) || 0)}
                className="text-base h-10"
              />
            </div>

            <div className="space-y-1.5 group">
              <Label htmlFor="maleAdults" className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Beef className="h-3.5 w-3.5 text-chart-males" />
                Adult Males
              </Label>
              <Input
                id="maleAdults"
                type="number"
                min={0}
                max={10000}
                value={maleAdults}
                onChange={(e) => setMaleAdults(parseInt(e.target.value) || 0)}
                className="text-base h-10"
              />
            </div>

            <div className="space-y-1.5 group md:col-span-2">
              <Label htmlFor="young" className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Baby className="h-3.5 w-3.5 text-accent" />
                Young Cattle
              </Label>
              <Input
                id="young"
                type="number"
                min={0}
                max={10000}
                value={young}
                onChange={(e) => setYoung(parseInt(e.target.value) || 0)}
                className="text-base h-10"
              />
            </div>
          </div>

          <div className="space-y-5 pt-2">
            {/* Projection Years */}
            <div className="space-y-2.5">
              <Label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                Projection Period: <span className="text-primary font-semibold tabular-nums ml-auto">{years} years</span>
              </Label>
              <Slider value={[years]} onValueChange={(v) => setYears(v[0])} min={1} max={20} step={1} className="py-1" />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>1 year</span><span>20 years</span>
              </div>
            </div>

            {/* Birth Rate */}
            <div className="space-y-2.5">
              <Label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Heart className="h-3.5 w-3.5 text-chart-secondary" />
                Birth Rate: <span className="text-primary font-semibold tabular-nums ml-auto">{birthRate}%</span>
              </Label>
              <Slider value={[birthRate]} onValueChange={(v) => setBirthRate(v[0])} min={50} max={100} step={5} className="py-1" />
              <p className="text-[10px] text-muted-foreground">% of adult cows producing calves annually</p>
            </div>

            {/* Mortality Rate */}
            <div className="space-y-2.5">
              <Label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Skull className="h-3.5 w-3.5 text-destructive" />
                Mortality: <span className="text-primary font-semibold tabular-nums ml-auto">{mortalityRate}%</span>
              </Label>
              <Slider value={[mortalityRate]} onValueChange={(v) => setMortalityRate(v[0])} min={1} max={15} step={1} className="py-1" />
              <p className="text-[10px] text-muted-foreground">Annual death rate across entire herd</p>
            </div>

            {/* Cull Rate */}
            <div className="space-y-2.5">
              <Label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Scissors className="h-3.5 w-3.5 text-chart-males" />
                Cull / Sales: <span className="text-primary font-semibold tabular-nums ml-auto">{cullRate}%</span>
              </Label>
              <Slider value={[cullRate]} onValueChange={(v) => setCullRate(v[0])} min={0} max={25} step={1} className="py-1" />
              <p className="text-[10px] text-muted-foreground">% of adults removed for sales or culling</p>
            </div>
          </div>

          <Button type="submit" variant="hero" size="lg" className="w-full rounded-xl hover-lift group">
            <TrendingUp className="h-5 w-5 mr-2 transition-transform group-hover:translate-x-0.5" />
            Generate Projection
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
