import { useState } from "react";
import { BookOpen, Download, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { SimulatedYear, SimulationSummary } from "@/lib/stochasticSimulation";
import { formatNumber } from "@/lib/herdCalculations";

interface Section {
  title: string;
  content: string[];
}

interface ExplainSimulationProps {
  years: SimulatedYear[];
  mcSummary: SimulationSummary | null;
  config: {
    birthVol: number;
    mortVol: number;
    cullVol: number;
    droughtProb: number;
    diseaseProb: number;
    monteCarloRuns: number;
  };
  startingHerd: number;
}

function buildSimExplanation(
  years: SimulatedYear[],
  mcSummary: SimulationSummary | null,
  config: ExplainSimulationProps["config"],
  startingHerd: number
): Section[] {
  const sections: Section[] = [];
  const final = years[years.length - 1];
  const netChange = final ? final.herdEnd - startingHerd : 0;
  const growthPct = startingHerd > 0 ? ((netChange / startingHerd) * 100).toFixed(1) : "0";

  // Count events
  let droughts = 0, diseases = 0, goodEvents = 0;
  years.forEach(y => {
    y.events.forEach(e => {
      if (e.includes("Drought")) droughts++;
      if (e.includes("Disease")) diseases++;
      if (e.includes("Pasture") || e.includes("Vet")) goodEvents++;
    });
  });

  // Overview
  sections.push({
    title: "📋 What This Simulation Shows",
    content: [
      `This simulation took your deterministic herd projection (${formatNumber(startingHerd)} head) and injected real-world randomness — volatile birth/death rates, droughts, and disease outbreaks. The result shows one possible future for your herd under uncertain conditions.`,
      `Think of the deterministic projection as "what happens if everything goes exactly to plan." This simulation answers: "what happens when life gets in the way?"`,
    ],
  });

  // How it works
  sections.push({
    title: "🎲 How the Randomness Works",
    content: [
      `Each year, the simulation takes your base rates (birth, mortality, cull) and adds random variation within the volatility bands you set.`,
      `Birth Rate Volatility (±${(config.birthVol * 100).toFixed(0)}%): In a good year, more calves are born. In a bad year, fewer. This mimics real-world variation in fertility, bull performance, and nutrition.`,
      `Mortality Volatility (±${(config.mortVol * 100).toFixed(0)}%): Some years are kinder than others — fewer predators, better grazing, milder winters. Other years, losses spike.`,
      `Cull Volatility (±${(config.cullVol * 100).toFixed(0)}%): Market conditions, cash flow needs, and herd management decisions mean you don't always cull the same percentage.`,
    ],
  });

  // Shocks
  sections.push({
    title: "⚡ Environmental Shocks",
    content: [
      `Drought Probability (${(config.droughtProb * 100).toFixed(0)}% per year): When drought hits, mortality spikes and birth rates drop — just like in real rangeland conditions. ${droughts > 0 ? `This simulation had ${droughts} drought event${droughts > 1 ? "s" : ""}.` : "No droughts occurred in this run — lucky!"}`,
      `Disease Probability (${(config.diseaseProb * 100).toFixed(0)}% per year): Disease outbreaks cause sudden mortality increases. ${diseases > 0 ? `This simulation had ${diseases} disease outbreak${diseases > 1 ? "s" : ""}.` : "No disease outbreaks occurred this time."}`,
      goodEvents > 0
        ? `On the positive side, ${goodEvents} beneficial event${goodEvents > 1 ? "s" : ""} occurred (good pasture conditions or veterinary interventions) — these gave your herd a small boost.`
        : `No positive random events occurred in this run.`,
    ],
  });

  // Year-by-year
  if (years.length > 0) {
    const highlights: string[] = [];
    years.forEach((yr, i) => {
      const net = yr.births - yr.deaths - yr.sales;
      const eventStr = yr.events.length > 0 ? ` Events: ${yr.events.join(", ")}.` : "";
      const direction = net >= 0 ? "grew" : "shrank";

      if (yr.events.some(e => e.includes("Drought") || e.includes("Disease"))) {
        highlights.push(`Year ${yr.year}: "Shock Year!" The herd ${direction} by ${formatNumber(Math.abs(net))} head (${formatNumber(yr.births)} born, ${formatNumber(yr.deaths)} died, ${formatNumber(yr.sales)} sold). Ended at ${formatNumber(yr.herdEnd)}.${eventStr}`);
      } else if (net > 0 && i > 0 && net > (years[i - 1].births - years[i - 1].deaths - years[i - 1].sales) * 1.3) {
        highlights.push(`Year ${yr.year}: "Strong Growth!" +${formatNumber(net)} head — births (${formatNumber(yr.births)}) well outpaced losses. Herd reached ${formatNumber(yr.herdEnd)}.${eventStr}`);
      } else {
        highlights.push(`Year ${yr.year}: Herd ${direction} by ${formatNumber(Math.abs(net))} head to ${formatNumber(yr.herdEnd)} (${formatNumber(yr.births)} born, ${formatNumber(yr.deaths)} died, ${formatNumber(yr.sales)} sold).${eventStr}`);
      }
    });
    sections.push({ title: "📅 Year-by-Year Walkthrough", content: highlights });
  }

  // Final outcome
  if (final) {
    sections.push({
      title: "📈 Simulation Outcome",
      content: [
        `Over ${years.length} years, your herd ${netChange >= 0 ? "grew" : "shrank"} from ${formatNumber(startingHerd)} to ${formatNumber(final.herdEnd)} — a ${netChange >= 0 ? "+" : ""}${formatNumber(netChange)} head change (${growthPct}%).`,
        `The simulation experienced ${droughts + diseases} negative shock${droughts + diseases !== 1 ? "s" : ""} and ${goodEvents} positive event${goodEvents !== 1 ? "s" : ""} across the period.`,
        netChange >= 0
          ? `Despite the randomness, your herd still grew. This suggests your base parameters are robust enough to absorb shocks.`
          : `The herd declined under these conditions. This could indicate your margins are too thin to absorb shocks — consider lowering the cull rate or improving mortality assumptions.`,
      ],
    });
  }

  // Monte Carlo
  if (mcSummary) {
    const spread = mcSummary.maxFinalHerd - mcSummary.minFinalHerd;
    const cv = mcSummary.meanFinalHerd > 0 ? ((mcSummary.stdFinalHerd / mcSummary.meanFinalHerd) * 100).toFixed(1) : "0";
    sections.push({
      title: "🎯 Monte Carlo Analysis",
      content: [
        `You ran ${config.monteCarloRuns} simulations in parallel. Each one used the same starting herd but different random events — giving you a statistical picture of possible outcomes.`,
        `Average Final Herd: ${formatNumber(mcSummary.meanFinalHerd)} head. This is the most likely outcome across all simulations.`,
        `Range: ${formatNumber(mcSummary.minFinalHerd)} (worst case) to ${formatNumber(mcSummary.maxFinalHerd)} (best case) — a spread of ${formatNumber(spread)} head.`,
        `Standard Deviation: ±${formatNumber(mcSummary.stdFinalHerd)} (${cv}% coefficient of variation). ${Number(cv) < 15 ? "This is relatively stable — your herd's future is fairly predictable." : Number(cv) < 30 ? "Moderate variability — outcomes depend significantly on whether shocks occur." : "High variability — your herd's future is very sensitive to random events. Consider reducing risk exposure."}`,
        `5th Percentile (P5): ${formatNumber(mcSummary.p5FinalHerd)} — in 95% of simulations the herd ended above this number. Think of this as your "bad luck" floor.`,
        `95th Percentile (P95): ${formatNumber(mcSummary.p95FinalHerd)} — only 5% of simulations did better than this. This is your optimistic ceiling.`,
      ],
    });
  }

  // Practical advice
  sections.push({
    title: "💡 What to Do With These Results",
    content: [
      `Use the single-run result to understand one possible path — but don't bet the farm on it. One simulation is one roll of the dice.`,
      `Use Monte Carlo for planning. The P5 value is your conservative budget number. The mean is your expected outcome. The P95 is your upside.`,
      `If the spread between P5 and P95 is very wide, your herd is vulnerable to shocks. Consider building reserves, diversifying income, or adjusting stocking rates.`,
      `Try increasing drought/disease probability to stress-test your herd plan. If the P5 drops below a sustainable level, your current strategy may be too risky.`,
    ],
  });

  return sections;
}

function sectionsToPlainText(sections: Section[]): string {
  const title = "Event Simulation — Plain English Explanation";
  const lines: string[] = [
    title, "=".repeat(title.length),
    `Generated: ${new Date().toLocaleDateString("en-AU", { year: "numeric", month: "long", day: "numeric" })}`,
    "",
  ];
  for (const s of sections) {
    lines.push(s.title.replace(/[^\w\s()%+\-.,♀♂:]/g, "").trim());
    lines.push("-".repeat(40));
    for (const item of s.content) { lines.push(item); lines.push(""); }
    lines.push("");
  }
  return lines.join("\n");
}

export function ExplainSimulation({ years, mcSummary, config, startingHerd }: ExplainSimulationProps) {
  const [open, setOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({});

  if (!years.length) return null;

  const sections = buildSimExplanation(years, mcSummary, config, startingHerd);
  const toggleSection = (i: number) =>
    setExpandedSections(prev => ({ ...prev, [i]: !prev[i] }));

  const handleDownload = () => {
    const text = sectionsToPlainText(sections);
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "event-simulation-explained.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="outline" size="sm" className="gap-2 rounded-xl hover-lift">
        <BookOpen className="h-4 w-4" />
        Explain Simulation
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl" style={{ fontFamily: "'Playfair Display', serif" }}>
              <BookOpen className="h-5 w-5 text-primary" />
              Simulation Results — Explained Simply
            </DialogTitle>
            <DialogDescription>
              Plain-English breakdown of what the simulation did, what happened, and what it means for your herd.
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
