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

function buildYearSentence(
  curr: HerdData,
  prev: HerdData,
  next: HerdData | undefined,
  index: number,
  projections: HerdData[],
  config: ExplainReportProps["config"]
): string {
  const net = curr.total - prev.total;
  const pct = prev.total > 0 ? ((net / prev.total) * 100) : 0;
  const birthRate = config?.birthRate ?? 0.85;
  const cullRate = config?.cullRate ?? 0.10;
  const mort = config?.mortalityRate ?? 0.05;

  // Detect Fibonacci jump: maturation kicks in — young from 2 years ago become breeders
  const isFibJump = index >= 2 && curr.adults > prev.adults * 1.08;
  // Detect slow start: no young yet to mature
  const isSlowStart = index <= 2 && Math.abs(pct) < 3;
  // Detect sustainability: culls roughly match births
  const cullsNearBirths = Math.abs(curr.culled - curr.femaleBirths) < curr.femaleBirths * 0.25;
  // Detect growth acceleration
  const prevPct = index >= 2 ? ((projections[index].total - projections[index - 1].total) / projections[index - 1].total) * 100 : 0;
  const isAccelerating = index >= 3 && pct > prevPct * 1.3 && pct > 3;
  // Detect decline
  const isDecline = net < 0;
  // Detect plateau
  const isPlateau = Math.abs(pct) < 1;

  const totalStr = curr.total.toLocaleString();
  const netStr = Math.abs(net).toLocaleString();
  const pctStr = Math.abs(pct).toFixed(1);

  let sentence = "";

  if (isFibJump) {
    const newBreeders = curr.adults - prev.adults;
    sentence = `"The Fibonacci Jump!" Your Year ${curr.year - 2} calves have now matured into the breeding pool — adding roughly ${Math.max(0, newBreeders).toLocaleString()} new breeders. This drives ${curr.femaleBirths + curr.maleBirths} new births, pushing the herd to ${totalStr} (${net > 0 ? "+" : ""}${netStr} head, ${pctStr}% ${net > 0 ? "growth" : "change"}).`;
  } else if (isSlowStart && index === 1) {
    sentence = `"The Herd Remains Stable." Your initial young are still maturing — births are coming only from your original ${prev.adults.toLocaleString()} breeders (${curr.femaleBirths + curr.maleBirths} calves born). Total herd: ${totalStr}.`;
  } else if (isSlowStart && index === 2) {
    sentence = `"Growth Is Slow But Steady." The first batch of calves is growing but not yet ready to breed. ${curr.femaleBirths + curr.maleBirths} births this year, ${curr.deaths} deaths, ${curr.culled} culled — herd holds at ${totalStr}.`;
  } else if (cullsNearBirths && !isDecline && !isFibJump) {
    sentence = `"Sustainability Check." Your ${(cullRate * 100).toFixed(0)}% cull rate (${curr.culled} animals) is closely matched by ${curr.femaleBirths + curr.maleBirths} new births — the herd is maintaining itself at ${totalStr} with ${net >= 0 ? "+" : ""}${netStr} head change.`;
  } else if (isDecline) {
    sentence = `"Herd Contracting." Deaths (${curr.deaths}) and culls (${curr.culled}) outpaced ${curr.femaleBirths + curr.maleBirths} births this year. The herd dropped ${netStr} head (${pctStr}%) to ${totalStr}. Consider reviewing your ${(mort * 100).toFixed(0)}% mortality or ${(cullRate * 100).toFixed(0)}% cull rate.`;
  } else if (isAccelerating) {
    sentence = `"Accelerating Growth!" Maturing young are swelling the breeding pool — ${curr.femaleBirths + curr.maleBirths} births this year versus ${curr.deaths + curr.culled} leaving. Herd jumps ${netStr} head (+${pctStr}%) to ${totalStr}.`;
  } else if (isPlateau) {
    sentence = `"Holding Steady." Births (${curr.femaleBirths + curr.maleBirths}) and losses (${curr.deaths} deaths + ${curr.culled} culled + ${curr.bullsSold ?? 0} bulls sold) are nearly balanced. Total remains around ${totalStr}.`;
  } else {
    const direction = net > 0 ? "grows by" : "shrinks by";
    sentence = `The herd ${direction} ${netStr} head (${pctStr}%) to ${totalStr} — ${curr.femaleBirths.toLocaleString()} ♀ & ${curr.maleBirths.toLocaleString()} ♂ born, ${curr.deaths.toLocaleString()} died, ${curr.culled.toLocaleString()} culled, ${(curr.bullsSold ?? 0).toLocaleString()} bulls sold.`;
  }

  return sentence;
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
        `You are starting with ${initial.total.toLocaleString()} cattle in total: ${initial.adults.toLocaleString()} breeding females, ${bullsN.toLocaleString()} adult bulls, ${femaleYoung0.toLocaleString()} young females, and ${maleYoung0.toLocaleString()} young males.`,
        `♀ Breeding Females (${initial.adults.toLocaleString()}): These are the engine of your herd. At a ${(birthRate * 100).toFixed(0)}% birth rate they produce roughly ${estFemaleBirths.toLocaleString()} female calves and ${estMaleBirths.toLocaleString()} male calves every year. Each year about ${estCulled.toLocaleString()} will be culled (${(cull * 100).toFixed(0)}%) and ${estFemaleDeaths.toLocaleString()} will die from natural causes (${(mort * 100).toFixed(0)}% mortality).`,
        `♂ Adult Bulls (${bullsN.toLocaleString()}): 50% are sold annually — so about ${estBullsSold.toLocaleString()} bulls leave the herd each year. Of those that stay, roughly ${estBullDeaths.toLocaleString()} will die from natural causes.`,
        `♀ Young Females (${femaleYoung0.toLocaleString()}): These are calves and yearlings not yet breeding. Roughly ${estFemaleYoungDeaths.toLocaleString()} will die each year. After 2 years they mature and join the breeding female pool — this is the "Fibonacci Jump" that drives future growth.`,
        `♂ Young Males (${maleYoung0.toLocaleString()}): Similar pipeline — roughly ${estMaleYoungDeaths.toLocaleString()} die annually. After 2 years they graduate into the bull pool, then the 50% annual sales rule applies immediately.`,
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

  // ─── Year-by-year enriched prose ───
  if (projections.length > 1) {
    const highlights: string[] = [];

    for (let i = 1; i < projections.length; i++) {
      const prev = projections[i - 1];
      const curr = projections[i];
      const next = projections[i + 1];
      const sentence = buildYearSentence(curr, prev, next, i, projections, config);
      highlights.push(`Year ${curr.year}: ${sentence}`);
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
                      {section.content.map((item, j) => {
                        // Bold quoted labels like "The Fibonacci Jump!"
                        const quotedMatch = item.match(/^(".*?")(.*)/s);
                        return (
                          <p key={j} className="text-sm text-muted-foreground leading-relaxed">
                            {quotedMatch ? (
                              <>
                                <span className="font-semibold text-foreground">{quotedMatch[1]}</span>
                                {quotedMatch[2]}
                              </>
                            ) : item}
                          </p>
                        );
                      })}
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
