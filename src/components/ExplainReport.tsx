import { useState } from "react";
import { BookOpen, Download, X, ChevronDown, ChevronUp } from "lucide-react";
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
    adults: number;
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

  // ─── Overview ───
  const growthPct = initial && final
    ? (((final.total - initial.total) / initial.total) * 100).toFixed(1)
    : "0";
  sections.push({
    title: "📋 What This Report Shows",
    content: [
      mode === "projection"
        ? `This report projects how your herd of ${initial?.total?.toLocaleString() ?? 0} cattle could grow over ${config?.years ?? 0} years using a Fibonacci-inspired mathematical model.`
        : `This report compares what your model predicted versus what actually happened in the field. It helps you see how accurate the model is and where real life differed from the forecast.`,
    ],
  });

  // ─── Starting Point ───
  if (initial && config) {
    sections.push({
      title: "🐄 Your Starting Herd",
      content: [
        `You started with ${initial.adults.toLocaleString()} breeding females and ${initial.young.toLocaleString()} young cattle (calves and yearlings).`,
        `That gives a total starting herd of ${initial.total.toLocaleString()} animals.`,
        `Only the ${initial.adults.toLocaleString()} adult females can produce calves each year.`,
      ],
    });
  }

  // ─── How the maths works ───
  sections.push({
    title: "🔢 How the Maths Works (Step by Step)",
    content: [
      `Each year the model runs through these steps in order:`,
      `1. BIRTHS — Each breeding female has an ${((config?.birthRate ?? 0.85) * 100).toFixed(0)}% chance of producing a calf. Births are split 50% female and 50% male.`,
      `2. MORTALITY — ${((config?.mortalityRate ?? 0.05) * 100).toFixed(0)}% of every animal in the herd (adults and young) is removed to reflect natural deaths and losses.`,
      `3. CULLING / SALES — ${((config?.cullRate ?? 0.10) * 100).toFixed(0)}% of adult breeding females are culled or sold each year. This keeps the breeding herd manageable.`,
      `4. MALE SALES — All male calves are raised for 2 years, then automatically sold. They do not stay in the breeding herd.`,
      `5. FEMALE MATURATION — Female calves take 2 years to mature. After 2 years they join the adult breeding herd and start producing calves themselves.`,
      `This "delay before breeding" is the Fibonacci-inspired part — it mirrors how animal populations build slowly at first, then accelerate as new breeders come online.`,
    ],
  });

  // ─── What happened ───
  if (final && config) {
    sections.push({
      title: "📈 What the Model Predicts",
      content: [
        `After ${config.years} years your herd is projected to reach ${final.total.toLocaleString()} cattle.`,
        `That is a ${growthPct}% change from your starting point of ${initial?.total?.toLocaleString() ?? 0}.`,
        `The breeding female count moves from ${initial?.adults?.toLocaleString() ?? 0} to ${final.adults.toLocaleString()}.`,
        `Each year males are sold when they mature — this is a regular income stream your operation can count on.`,
      ],
    });
  }

  // ─── Comparison-specific ───
  if (mode === "comparison" && projections.some(p => p.actualTotal !== undefined)) {
    const mae = calculateMAE(projections);
    const mape = calculateMAPE(projections);
    const rmse = calculateRMSE(projections);
    const bias = calculateBias(projections);

    const accuracyLines: string[] = [];

    if (mape !== null) {
      const label = mape < 10 ? "excellent" : mape < 25 ? "moderate" : "poor";
      accuracyLines.push(
        `MAPE (Mean Absolute Percentage Error) is ${mape.toFixed(1)}% — this is ${label} accuracy. In plain terms, on average the model was ${mape.toFixed(1)}% off the real head count each year.`
      );
    }
    if (mae !== null) {
      accuracyLines.push(
        `MAE (Mean Absolute Error) is ${mae.toFixed(1)} head — on average the projection differed from reality by ${mae.toFixed(1)} animals per year.`
      );
    }
    if (rmse !== null) {
      accuracyLines.push(
        `RMSE (Root Mean Square Error) is ${rmse.toFixed(1)} — similar to MAE but punishes large single-year errors more heavily. A much higher RMSE than MAE signals one or two bad years skewing the result.`
      );
    }
    if (bias !== null) {
      const biasLabel = bias > 5 ? "over-projecting (the model is optimistic)" : bias < -5 ? "under-projecting (the model is conservative)" : "well-balanced with no significant lean";
      accuracyLines.push(
        `Bias is ${bias > 0 ? "+" : ""}${bias.toFixed(1)} — the model is ${biasLabel}. Positive means projected was higher than actual; negative means lower.`
      );
    }

    if (accuracyLines.length) {
      sections.push({
        title: "🎯 How Accurate Was the Model?",
        content: accuracyLines,
      });
    }

    sections.push({
      title: "💡 What to Do with This Information",
      content: [
        `If accuracy is good (MAPE < 10%) — your parameters are well-calibrated. Keep using the same birth rate, mortality, and cull rate.`,
        `If MAPE is between 10–25% — consider adjusting one parameter at a time. Start with birth rate as it has the biggest effect.`,
        `If MAPE is above 25% — real-world conditions may differ significantly (drought, disease, market). Review your mortality and cull rates.`,
        `If bias is strongly positive — the model is too optimistic. Try lowering birth rate or raising mortality slightly.`,
        `If bias is strongly negative — conditions in the field are better than assumed. You may be able to reduce culling.`,
      ],
    });
  } else if (mode === "projection") {
    sections.push({
      title: "💡 How to Use This Projection",
      content: [
        `Use the Year 1–3 figures for near-term budgeting — births and sales in those years are the most reliable.`,
        `Beyond Year 5 the compound effects of the model grow large, so treat longer-term projections as a planning range, not a guarantee.`,
        `Log your actual births, deaths, and sales in the Event Logging page each year. Then visit the Comparison Report to see how reality tracks against this forecast.`,
        `Adjust the birth rate and cull rate to model "best case" vs "worst case" scenarios for better risk planning.`,
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
    lines.push(s.title.replace(/[^\w\s()%+\-.,]/g, "").trim());
    lines.push("-".repeat(40));
    for (const line of s.content) {
      lines.push(line);
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
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        className="gap-2 hover-lift"
      >
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
              A plain-English breakdown of the numbers, the maths, and what it all means.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mt-2">
            {sections.map((section, i) => {
              const isOpen = expandedSections[i] !== false; // default open
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
                      {section.content.map((line, j) => (
                        <p key={j} className="text-sm text-muted-foreground leading-relaxed">{line}</p>
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
