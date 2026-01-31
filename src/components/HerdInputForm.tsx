import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Beef, Baby, Calendar, TrendingUp, Heart, Skull } from "lucide-react";

interface HerdInputFormProps {
  onSubmit: (data: {
    adults: number;
    young: number;
    years: number;
    birthRate: number;
    mortalityRate: number;
  }) => void;
}

export function HerdInputForm({ onSubmit }: HerdInputFormProps) {
  const [adults, setAdults] = useState<number>(50);
  const [young, setYoung] = useState<number>(20);
  const [years, setYears] = useState<number>(10);
  const [birthRate, setBirthRate] = useState<number>(85);
  const [mortalityRate, setMortalityRate] = useState<number>(5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      adults,
      young,
      years,
      birthRate: birthRate / 100,
      mortalityRate: mortalityRate / 100,
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
            {/* Adult Cattle */}
            <div className="space-y-2 group">
              <Label htmlFor="adults" className="flex items-center gap-2 text-sm font-medium">
                <Beef className="h-4 w-4 text-primary transition-transform group-focus-within:scale-110" />
                Adult Cattle (breeding age)
              </Label>
              <Input
                id="adults"
                type="number"
                min={1}
                max={10000}
                value={adults}
                onChange={(e) => setAdults(parseInt(e.target.value) || 0)}
                className="text-lg transition-all focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Young Cattle */}
            <div className="space-y-2 group">
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

          <Button type="submit" variant="hero" size="lg" className="w-full hover-lift group">
            <TrendingUp className="h-5 w-5 mr-2 transition-transform group-hover:translate-x-1" />
            Generate Projection
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
