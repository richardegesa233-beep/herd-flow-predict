import { useState } from "react";
import { BookOpen, Download, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { HerdData, ActualRecord, calculateMAE, calculateMAPE, calculateRMSE, calculateBias } from "@/lib/herdCalculations";

interface ExplainReportProps {
  projections: HerdData[];
  config?: {
    femaleAdults?: number;
    maleAdults?: number;
    adults?: number;
    young: number;
    years: number;
    birthRate: number;
    mortalityRate: number;
    cullRate: number;
  } | null;
  actuals?: ActualRecord[];
  mode?: "projection" | "comparison";
}

interface Section {
  title: string;
  content: string[];
}

function buildExplanation(
  projections: HerdData[],
  config: ExplainReportProps["config"],
  actuals: ActualRecord[],
  mode: "projection" | "comparison"
): Section[] {
  const sections: Section[] = [];
  const initial = projections[0];
  const final = projections[projections.length - 1];

  const growthPct = initial && final
    ? (((final.total - initial.total) / initial.total) * 100).toFixed(1)
    : "0";

  // ─── Overview ───
  sections.push({
    title: mode === "projection" ? "📋 What This Report Shows" : "📋 About This Comparison",
    content: [
      mode === "projection"
        ? `This report projects how your herd of ${initial?.total?.toLocaleString() ?? 0} cattle could grow over ${config?.years ?? 0} years using a Fibonacci-inspired mathematical model. It breaks down how many animals are born, die, are culled, and are sold each year — and how the herd total changes as a result.`
        : `This report compares what your model predicted versus what actually happened in the field. Use it to judge how accurate your birth rate, mortality, and cull assumptions are.`,
    ],
  });

  // ─── Starting Herd (Year 0) — prose only ───
  if (initial && config) {
    const femaleYoung0 = initial.young - (initial.males ?? 0);
    const maleYoung0 = initial.males ?? 0;
    const bullsN = config.maleAdults ?? 0;
    const mort = config.mortalityRate ?? 0.05;
    const cull = config.cullRate ?? 0.10;
    const birthRate = config.birthRate ?? 0.85;

    const estFemaleBirths = Math.round(initial.adults * birthRate * 0.5);
    const estMaleBirths = Math.round(initial.adults * birthRate * 0.5);
    const estFemaleDeaths = Math.round(initial.adults * mort);
    const estBullDeaths = Math.round(bullsN * mort);
    const estFemaleYoungDeaths = Math.round(femaleYoung0 * mort);
    const estMaleYoungDeaths = Math.round(maleYoung0 * mort);
    const estCulled = Math.round(initial.adults * cull);
    const estBullsSold = Math.round(bullsN * 0.5);

    sections.push({
      title: "🐄 Starting Herd at Year 0",
      content: [
        `You are starting with ${initial.total.toLocaleString()} cattle in total.`,
        `♀ Breeding Females: ${initial.adults.toLocaleString()} animals. Each year roughly ${estFemaleBirths.toLocaleString()} female calves and ${estMaleBirths.toLocaleString()} male calves will be born (${(birthRate * 100).toFixed(0)}% birth rate, split 50/50). About ${estCulled.toLocaleString()} breeders will be culled (${(cull * 100).toFixed(0)}%) and ${estFemaleDeaths.toLocaleString()} will die from natural causes (${(mort * 100).toFixed(0)}% mortality).`,
        `♂ Adult Bulls: ${bullsN.toLocaleString()} animals. About ${estBullsSold.toLocaleString()} bulls will be sold each year (50% sold annually) and ${estBullDeaths.toLocaleString()} will die from natural causes.`,
        `♀ Young Females: ${femaleYoung0.toLocaleString()} animals. About ${estFemaleYoungDeaths.toLocaleString()} will die each year. After 2 years they mature into the breeding female pool.`,
        `♂ Young Males: ${maleYoung0.toLocaleString()} animals. About ${estMaleYoungDeaths.toLocaleString()} will die each year. After 2 years they mature into the bull pool, then 50% of those bulls are sold.`,
      ],
    });
  }

  // ─── How the maths works ───
  sections.push({
    title: "🔢 How the Maths Works",
    content: [
      `Each year the model runs five steps in order:`,
      `1. BIRTHS — ${((config?.birthRate ?? 0.85) * 100).toFixed(0)}% of breeding females calve, with calves split evenly 50% female and 50% male.`,
      `2. MORTALITY — ${((config?.mortalityRate ?? 0.05) * 100).toFixed(0)}% is removed from every group (breeders, bulls, and young animals alike).`,
      `3. CULLING — ${((config?.cullRate ?? 0.10) * 100).toFixed(0)}% of adult breeding females are culled and removed from the herd.`,
      `4. BULL SALES — 50% of adult bulls are sold and removed each year.`,
      `5. MATURATION — young females (2 years old) graduate into the breeding female pool. Young males (2 years old) graduate into the bull pool, then the 50% bull sales rule applies immediately.`,
    ],
  });

  // ─── Year-by-year prose highlights ───
  if (projections.length > 1) {
    const highlights: string[] = [];

    for (let i = 1; i < projections.length; i++) {
      const prev = projections[i - 1];
      const curr = projections[i];
      const net = curr.total - prev.total;
      const pct = prev.total > 0 ? ((net / prev.total) * 100).toFixed(1) : "0";
      const direction = net > 0 ? "grew by" : net < 0 ? "shrank by" : "stayed flat at";
      const change = net !== 0 ? `${Math.abs(net).toLocaleString()} head (${Math.abs(Number(pct))}%)` : `${curr.total.toLocaleString()} head`;

      highlights.push(
        `Year ${curr.year}: The herd ${direction} ${change} — ${curr.femaleBirths.toLocaleString()} female & ${curr.maleBirths.toLocaleString()} male births, ${curr.deaths.toLocaleString()} deaths, ${curr.culled.toLocaleString()} culled, ${(curr.bullsSold ?? 0).toLocaleString()} bulls sold. Total: ${curr.total.toLocaleString()}.`
      );
    }

    sections.push({
      title: "📅 Year-by-Year Summary",
      content: highlights,
    });
  }

  // ─── Final projection summary ───
  if (final && initial && config) {
    const netChange = final.total - initial.total;
    sections.push({
      title: "📈 Final Projection Summary",
      content: [
        `Over ${config.years} years your herd is projected to ${netChange >= 0 ? "grow" : "shrink"} from ${initial.total.toLocaleString()} to ${final.total.toLocaleString()} — a ${netChange >= 0 ? "+" : ""}${netChange.toLocaleString()} head change (${growthPct}%).`,
        `Breeding females: ${initial.adults.toLocaleString()} → ${final.adults.toLocaleString()} (${final.adults - initial.adults >= 0 ? "+" : ""}${(final.adults - initial.adults).toLocaleString()}).`,
        `Adult bulls: ${(config.maleAdults ?? 0).toLocaleString()} → ${(final.maleAdults ?? 0).toLocaleString()} (${(final.maleAdults ?? 0) - (config.maleAdults ?? 0) >= 0 ? "+" : ""}${((final.maleAdults ?? 0) - (config.maleAdults ?? 0)).toLocaleString()}).`,
      ],
    });
  }

  // ─── Comparison accuracy ───
  if (mode === "comparison" && projections.some(p => p.actualTotal !== undefined)) {
    const mae = calculateMAE(projections);
    const mape = calculateMAPE(projections);
    const rmse = calculateRMSE(projections);
    const bias = calculateBias(projections);
    const accuracyLines: string[] = [];

    if (mape !== null) {
      const label = mape < 10 ? "excellent" : mape < 25 ? "moderate" : "poor";
      accuracyLines.push(`MAPE is ${mape.toFixed(1)}% — that is ${label} accuracy. On average the model was ${mape.toFixed(1)}% off per year.`);
    }
    if (mae !== null) accuracyLines.push(`MAE is ${mae.toFixed(1)} head — the average difference between projected and actual count per year.`);
    if (rmse !== null) accuracyLines.push(`RMSE is ${rmse.toFixed(1)}. A much higher RMSE than MAE signals that one or two years were particularly far off.`);
    if (bias !== null) {
      const biasLabel = bias > 5 ? "over-projecting (the model is optimistic)" : bias < -5 ? "under-projecting (the model is conservative)" : "well-balanced with no significant lean";
      accuracyLines.push(`Bias is ${bias > 0 ? "+" : ""}${bias.toFixed(1)} — the model is ${biasLabel}.`);
    }
    if (accuracyLines.length) sections.push({ title: "🎯 Model Accuracy", content: accuracyLines });

    sections.push({
      title: "💡 What to Do Next",
      content: [
        `If MAPE is below 10% — your model is well-calibrated, keep your current rates.`,
        `If MAPE is between 10–25% — try adjusting the birth rate first, it has the largest single effect on herd size.`,
        `If MAPE is above 25% — real-world conditions are significantly different from your assumptions (drought, disease outbreak). Review both mortality and cull rates.`,
        `If bias is strongly positive — the model is too optimistic. Consider lowering the birth rate or raising the mortality rate.`,
        `If bias is strongly negative — real conditions are better than assumed. Consider reducing the cull rate.`,
      ],
    });
  } else if (mode === "projection") {
    sections.push({
      title: "💡 How to Use This Projection",
      content: [
        `Year 1 to 3 figures are the most reliable and suitable for near-term budgeting and planning.`,
        `Beyond Year 5, treat projections as a planning range rather than a guarantee — small changes in birth rate or mortality compound over time.`,
        `Log actual births, deaths, and sales in Event Logging, then open the Comparison Report to measure how accurate your model is.`,
      ],
    });
  }

  return sections;
}

function sectionsToPlainText(sections: Section[], title: string): string {
  const lines: string[] = [
    title,
    "=".repeat(title.length),
    `Generated: ${new Date().toLocaleDateString("en-AU", { year: "numeric", month: "long", day: "numeric" })}`,
    "",
  ];
  for (const s of sections) {
    lines.push(s.title.replace(/[^\w\s()%+\-.,♀♂:]/g, "").trim());
    lines.push("-".repeat(40));
    for (const item of s.content) {
      lines.push(item);
      lines.push("");
    }
    lines.push("");
  }
  return lines.join("\n");
}

export function ExplainReport({ projections, config, actuals = [], mode = "projection" }: ExplainReportProps) {
  const [open, setOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({});

  if (!projections.length) return null;

  const sections = buildExplanation(projections, config, actuals, mode);
  const toggleSection = (i: number) =>
    setExpandedSections(prev => ({ ...prev, [i]: !prev[i] }));

  const handleDownload = () => {
    const reportTitle = mode === "projection" ? "Herd Projection — Plain English Explanation" : "Comparison Report — Plain English Explanation";
    const text = sectionsToPlainText(sections, reportTitle);
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = mode === "projection" ? "herd-projection-explained.txt" : "comparison-report-explained.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="outline" className="gap-2 hover-lift">
        <BookOpen className="h-4 w-4" />
        Explain This Report
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-display">
              <BookOpen className="h-5 w-5 text-primary" />
              {mode === "projection" ? "Your Herd Projection — Explained Simply" : "Comparison Report — Explained Simply"}
            </DialogTitle>
            <DialogDescription>
              Plain-English breakdown — animal types, numbers, births, deaths, sold, and culled.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mt-2">
            {sections.map((section, i) => {
              const isOpen = expandedSections[i] !== false;
              return (
                <div key={i} className="border border-border rounded-lg overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between px-4 py-3 bg-muted/40 hover:bg-muted/70 transition-colors text-left"
                    onClick={() => toggleSection(i)}
                  >
                    <span className="font-semibold text-foreground text-sm">{section.title}</span>
                    {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
                  </button>
                  {isOpen && (
                    <div className="px-4 py-3 space-y-2">
                      {section.content.map((item, j) => (
                        <p key={j} className="text-sm text-muted-foreground leading-relaxed">{item}</p>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-border mt-4">
            <p className="text-xs text-muted-foreground">Download a plain text copy for your records</p>
            <Button onClick={handleDownload} variant="default" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Download (.txt)
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
