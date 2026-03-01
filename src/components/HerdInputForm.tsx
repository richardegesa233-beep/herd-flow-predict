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
    <Card className="shadow-card hover:shadow-card-hover transition-all duration-300">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-display flex items-center gap-2">
          <Beef className="h-6 w-6 text-primary" />
          Herd Configuration
        </CardTitle>
        <CardDescription>
          Enter your current herd details to generate growth projections
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Female Adults */}
            <div className="space-y-2 group">
              <Label htmlFor="femaleAdults" className="flex items-center gap-2 text-sm font-medium">
                <Beef className="h-4 w-4 text-primary transition-transform group-focus-within:scale-110" />
                Adult Females (breeding cows)
              </Label>
              <Input
                id="femaleAdults"
                type="number"
                min={1}
                max={10000}
                value={femaleAdults}
                onChange={(e) => setFemaleAdults(parseInt(e.target.value) || 0)}
                className="text-lg transition-all focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Male Adults */}
            <div className="space-y-2 group">
              <Label htmlFor="maleAdults" className="flex items-center gap-2 text-sm font-medium">
                <Beef className="h-4 w-4 text-chart-males transition-transform group-focus-within:scale-110" />
                Adult Males (bulls)
              </Label>
              <Input
                id="maleAdults"
                type="number"
                min={0}
                max={10000}
                value={maleAdults}
                onChange={(e) => setMaleAdults(parseInt(e.target.value) || 0)}
                className="text-lg transition-all focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Young Cattle */}
            <div className="space-y-2 group md:col-span-2">
              <Label htmlFor="young" className="flex items-center gap-2 text-sm font-medium">
                <Baby className="h-4 w-4 text-accent transition-transform group-focus-within:scale-110" />
                Young Cattle (calves & yearlings)
              </Label>
              <Input
                id="young"
                type="number"
                min={0}
                max={10000}
                value={young}
                onChange={(e) => setYoung(parseInt(e.target.value) || 0)}
                className="text-lg transition-all focus:ring-2 focus:ring-accent/20"
              />
            </div>
          </div>

          {/* Projection Years */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Projection Period: <span className="text-primary font-semibold tabular-nums">{years} years</span>
            </Label>
            <Slider
              value={[years]}
              onValueChange={(value) => setYears(value[0])}
              min={1}
              max={20}
              step={1}
              className="py-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1 year</span>
              <span>20 years</span>
            </div>
          </div>

          {/* Birth Rate */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Heart className="h-4 w-4 text-chart-secondary" />
              Birth Rate: <span className="text-primary font-semibold tabular-nums">{birthRate}%</span>
            </Label>
            <Slider
              value={[birthRate]}
              onValueChange={(value) => setBirthRate(value[0])}
              min={50}
              max={100}
              step={5}
              className="py-2"
            />
            <p className="text-xs text-muted-foreground">
              Percentage of adult cows producing calves annually
            </p>
          </div>

          {/* Mortality Rate */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Skull className="h-4 w-4 text-destructive" />
              Mortality Rate: <span className="text-primary font-semibold tabular-nums">{mortalityRate}%</span>
            </Label>
            <Slider
              value={[mortalityRate]}
              onValueChange={(value) => setMortalityRate(value[0])}
              min={1}
              max={15}
              step={1}
              className="py-2"
            />
            <p className="text-xs text-muted-foreground">
              Annual death rate across the entire herd
            </p>
          </div>

          {/* Cull / Sales Rate */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Scissors className="h-4 w-4 text-chart-males" />
              Cull / Sales Rate: <span className="text-primary font-semibold tabular-nums">{cullRate}%</span>
            </Label>
            <Slider
              value={[cullRate]}
              onValueChange={(value) => setCullRate(value[0])}
              min={0}
              max={25}
              step={1}
              className="py-2"
            />
            <p className="text-xs text-muted-foreground">
              Percentage of adults removed annually for sales or culling
            </p>
          </div>

          <Button type="submit" variant="hero" size="lg" className="w-full hover-lift group">
            <TrendingUp className="h-5 w-5 mr-2 transition-transform group-hover:translate-x-1" />
            Generate Projection
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
