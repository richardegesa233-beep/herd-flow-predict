import { useState } from "react";
import { BookOpen, Download, ChevronDown, ChevronUp, Maximize2, Minimize2 } from "lucide-react";
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
  content: (string | { type: "table"; headers: string[]; rows: string[][]; fullTable?: boolean })[];
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
    title: "📋 What This Report Shows",
    content: [
      mode === "projection"
        ? `This report projects how your herd of ${initial?.total?.toLocaleString() ?? 0} cattle could grow over ${config?.years ?? 0} years using a Fibonacci-inspired mathematical model.`
        : `This report compares what your model predicted versus what actually happened in the field.`,
    ],
  });

  // ─── Starting Herd (Year 0 snapshot) ───
  if (initial && config) {
    const femaleYoung0 = initial.young - (initial.males ?? 0);
    const maleYoung0 = initial.males ?? 0;
    const bullsN = config.maleAdults ?? 0;
    const mort = config.mortalityRate ?? 0.05;
    const cull = config.cullRate ?? 0.10;

    // Plain-English narrative
    const narrativeParts: string[] = [];
    narrativeParts.push(
      `You are starting with ${initial.total.toLocaleString()} cattle total: ` +
      `${initial.adults.toLocaleString()} breeding females, ` +
      `${bullsN.toLocaleString()} adult bulls, ` +
      `${femaleYoung0.toLocaleString()} young females, and ` +
      `${maleYoung0.toLocaleString()} young males.`
    );
    narrativeParts.push(
      `Each year, roughly ${Math.round(initial.adults * cull)} breeding females will be culled (${(cull * 100).toFixed(0)}%), ` +
      `${Math.round(initial.adults * mort)} will die from natural causes (${(mort * 100).toFixed(0)}% mortality), and ` +
      `${bullsN > 0 ? `about ${Math.round(bullsN * 0.5)} of the ${bullsN} adult bulls will be sold (50%).` : "no bulls will be sold yet (no adult bulls at start)."}`
    );
    narrativeParts.push(
      `Young animals mature into the adult pool after 2 years — young females join the breeders, young males join the bull pool before 50% are sold.`
    );

    sections.push({
      title: "🐄 Starting Herd at Year 0",
      content: [
        narrativeParts.join(" "),
        {
          type: "table",
          headers: ["Animal Type", "No.", "Sold/yr", "Culled/yr", "Died/yr"],
          rows: [
            [
              "♀ Breeding Females",
              initial.adults.toLocaleString(),
              "—",
              `~${Math.round(initial.adults * cull).toLocaleString()}`,
              `~${Math.round(initial.adults * mort).toLocaleString()}`,
            ],
            [
              "♂ Adult Bulls",
              bullsN.toLocaleString(),
              `~${Math.round(bullsN * 0.5).toLocaleString()} (50%)`,
              "—",
              `~${Math.round(bullsN * mort).toLocaleString()}`,
            ],
            [
              "♀ Young Females",
              femaleYoung0.toLocaleString(),
              "—",
              "—",
              `~${Math.round(femaleYoung0 * mort).toLocaleString()}`,
            ],
            [
              "♂ Young Males",
              maleYoung0.toLocaleString(),
              "—",
              "—",
              `~${Math.round(maleYoung0 * mort).toLocaleString()}`,
            ],
            [
              "Total",
              initial.total.toLocaleString(),
              "—", "—", "—",
            ],
          ],
        },
      ],
    });
  }

  // ─── How it works ───
  sections.push({
    title: "🔢 How the Maths Works",
    content: [
      `Each year runs these steps: (1) BIRTHS — ${((config?.birthRate ?? 0.85) * 100).toFixed(0)}% of breeding females calve, split 50/50 ♀/♂. (2) MORTALITY — ${((config?.mortalityRate ?? 0.05) * 100).toFixed(0)}% removed from all groups. (3) CULLING — ${((config?.cullRate ?? 0.10) * 100).toFixed(0)}% of adult females sold. (4) BULL SALES — 50% of adult bulls sold annually. (5) MATURATION — young females and males join adult pools after 2 years.`,
    ],
  });

  // ─── Year by Year (structured table) ───
  if (projections.length > 1) {
    const headers = [
      "Year",
      "♀ Breeders", "♂ Bulls", "♀ Young", "♂ Young", "Total",
      "♀ Births", "♂ Births", "Deaths", "Culled", "Bulls Sold", "Net Change",
    ];
    const rows: string[][] = [];

    for (let i = 1; i < projections.length; i++) {
      const prev = projections[i - 1];
      const curr = projections[i];
      const change = curr.total - prev.total;
      const femalYoung = curr.young - (curr.males ?? 0);

      rows.push([
        `Year ${curr.year}`,
        curr.adults.toLocaleString(),
        (curr.maleAdults ?? 0).toLocaleString(),
        femalYoung.toLocaleString(),
        (curr.males ?? 0).toLocaleString(),
        curr.total.toLocaleString(),
        `+${curr.femaleBirths.toLocaleString()}`,
        `+${curr.maleBirths.toLocaleString()}`,
        `-${curr.deaths.toLocaleString()}`,
        `-${curr.culled.toLocaleString()}`,
        `-${(curr.bullsSold ?? 0).toLocaleString()}`,
        `${change >= 0 ? "+" : ""}${change.toLocaleString()}`,
      ]);
    }

    sections.push({
      title: "📅 Year-by-Year Breakdown (All Animal Types)",
      content: [{ type: "table", headers, rows, fullTable: true }],
    });
  }

  // ─── Final summary ───
  if (final && config) {
    sections.push({
      title: "📈 Final Projection Summary",
      content: [
        {
          type: "table",
          headers: ["Animal Type", `Year 0`, `Year ${config.years}`, "Change"],
          rows: [
            ["♀ Breeders", initial?.adults.toLocaleString() ?? "0", final.adults.toLocaleString(), `${final.adults - (initial?.adults ?? 0) >= 0 ? "+" : ""}${(final.adults - (initial?.adults ?? 0)).toLocaleString()}`],
            ["♂ Bulls", (config.maleAdults ?? 0).toLocaleString(), (final.maleAdults ?? 0).toLocaleString(), `${(final.maleAdults ?? 0) - (config.maleAdults ?? 0) >= 0 ? "+" : ""}${((final.maleAdults ?? 0) - (config.maleAdults ?? 0)).toLocaleString()}`],
            ["Total", initial?.total.toLocaleString() ?? "0", final.total.toLocaleString(), `${growthPct}%`],
          ],
        },
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
      accuracyLines.push(`MAPE: ${mape.toFixed(1)}% — ${label} accuracy. On average the model was ${mape.toFixed(1)}% off per year.`);
    }
    if (mae !== null) accuracyLines.push(`MAE: ${mae.toFixed(1)} head average difference per year.`);
    if (rmse !== null) accuracyLines.push(`RMSE: ${rmse.toFixed(1)} — a much higher RMSE than MAE signals one or two bad years.`);
    if (bias !== null) {
      const biasLabel = bias > 5 ? "over-projecting (optimistic)" : bias < -5 ? "under-projecting (conservative)" : "well-balanced";
      accuracyLines.push(`Bias: ${bias > 0 ? "+" : ""}${bias.toFixed(1)} — ${biasLabel}.`);
    }
    if (accuracyLines.length) sections.push({ title: "🎯 Model Accuracy", content: accuracyLines });

    sections.push({
      title: "💡 What to Do",
      content: [
        `MAPE < 10% — well-calibrated, keep your rates.`,
        `MAPE 10–25% — adjust birth rate first, it has the biggest effect.`,
        `MAPE > 25% — real-world conditions differ significantly (drought, disease). Review mortality & cull rates.`,
        `Strong positive bias — model is too optimistic. Lower birth rate or raise mortality.`,
        `Strong negative bias — conditions better than assumed. Consider reducing culling.`,
      ],
    });
  } else if (mode === "projection") {
    sections.push({
      title: "💡 How to Use This Projection",
      content: [
        `Year 1–3 figures are most reliable for near-term budgeting.`,
        `Beyond Year 5, treat projections as a planning range, not a guarantee.`,
        `Log actual births, deaths, and sales in Event Logging, then check the Comparison Report for accuracy.`,
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
    lines.push(s.title.replace(/[^\w\s()%+\-.,♀♂]/g, "").trim());
    lines.push("-".repeat(40));
    for (const item of s.content) {
      if (typeof item === "string") {
        lines.push(item);
      } else {
        // Render table as text
        lines.push(item.headers.join(" | "));
        lines.push("-".repeat(60));
        for (const row of item.rows) lines.push(row.join(" | "));
      }
      lines.push("");
    }
    lines.push("");
  }
  return lines.join("\n");
}

function RenderTable({ headers, rows, fullTable }: { headers: string[]; rows: string[][]; fullTable?: boolean }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="space-y-1">
      {fullTable && (
        <button
          className="flex items-center gap-1 text-xs text-primary hover:underline ml-auto"
          onClick={() => setExpanded(e => !e)}
        >
          {expanded ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
          {expanded ? "Collapse table" : "Expand full table"}
        </button>
      )}
      <div
        className={`overflow-x-auto rounded-md border border-border ${fullTable && !expanded ? "max-h-64 overflow-y-auto" : ""}`}
      >
        <table className="w-full text-xs">
          <thead className="sticky top-0 z-10">
            <tr className="bg-muted/90 backdrop-blur-sm border-b border-border">
              {headers.map((h, i) => (
                <th key={i} className="px-3 py-2 text-left font-semibold text-foreground whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} className={ri % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                {row.map((cell, ci) => {
                  const isLast = ci === row.length - 1;
                  const isPositive = cell.startsWith("+");
                  const isNegative = cell.startsWith("-");
                  return (
                    <td
                      key={ci}
                      className={`px-3 py-1.5 whitespace-nowrap font-medium
                        ${isLast && isPositive ? "text-primary" : ""}
                        ${isLast && isNegative ? "text-destructive" : ""}
                        ${ci === 0 ? "font-semibold text-foreground" : "text-muted-foreground"}
                      `}
                    >
                      {cell}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
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
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-display">
              <BookOpen className="h-5 w-5 text-primary" />
              {mode === "projection" ? "Your Herd Projection — Explained Simply" : "Comparison Report — Explained Simply"}
            </DialogTitle>
            <DialogDescription>
              Plain-English breakdown by animal type — births, deaths, sold, culled per year.
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
                    <div className="px-4 py-3 space-y-3">
                      {section.content.map((item, j) =>
                        typeof item === "string"
                          ? <p key={j} className="text-sm text-muted-foreground leading-relaxed">{item}</p>
                          : <RenderTable key={j} headers={item.headers} rows={item.rows} fullTable={item.fullTable} />
                      )}
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
