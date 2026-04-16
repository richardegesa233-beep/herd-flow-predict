import { useState } from "react";
import { History, Download, Trash2, Pencil, Check, X, Plus } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { HerdData, ActualRecord } from "@/lib/herdCalculations";
import { toast } from "sonner";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export interface ProjectionSnapshot {
  id: string;
  name: string;
  savedAt: string;
  config: {
    femaleAdults: number;
    maleAdults: number;
    young: number;
    years: number;
    birthRate: number;
    mortalityRate: number;
    cullRate: number;
  };
  projections: HerdData[];
  eventRecords?: ActualRecord[];
}

interface ProjectionHistoryProps {
  currentProjections: HerdData[];
  currentConfig: {
    femaleAdults: number;
    maleAdults: number;
    young: number;
    years: number;
    birthRate: number;
    mortalityRate: number;
    cullRate: number;
  } | null;
  onLoad: (snapshot: ProjectionSnapshot) => void;
}

function downloadCsv(snapshot: ProjectionSnapshot) {
  const headers = ["Year", "♀ Breeders", "♂ Bulls", "♀ Young", "♂ Young", "Total", "♀ Births", "♂ Births", "Deaths", "Culled", "Bulls Sold"];
  const rows = snapshot.projections.map(r => [
    r.year,
    r.adults,
    r.maleAdults ?? 0,
    r.young - (r.males ?? 0),
    r.males ?? 0,
    r.total,
    r.femaleBirths,
    r.maleBirths,
    r.deaths,
    r.culled,
    r.bullsSold ?? 0,
  ]);
  const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${snapshot.name.replace(/\s+/g, "-").toLowerCase()}-projection.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function ProjectionHistory({ currentProjections, currentConfig, onLoad }: ProjectionHistoryProps) {
  const [open, setOpen] = useState(false);
  const [snapshots, setSnapshots] = useLocalStorage<ProjectionSnapshot[]>("herd-projection-history", []);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [saveName, setSaveName] = useState("");
  const [showSave, setShowSave] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleSave = () => {
    if (!currentConfig || currentProjections.length === 0) {
      toast.error("No projection data to save.");
      return;
    }
    const name = saveName.trim() || `Projection ${new Date().toLocaleDateString("en-AU")}`;
    // Also capture current event records
    let eventRecords: ActualRecord[] = [];
    try {
      const session = window.localStorage.getItem("fhps-session");
      const prefix = session ? `fhps-${JSON.parse(session).id}` : "fhps-guest";
      const stored = window.localStorage.getItem(`${prefix}-event-records`);
      if (stored) eventRecords = JSON.parse(stored);
    } catch {}
    const snapshot: ProjectionSnapshot = {
      id: Date.now().toString(),
      name,
      savedAt: new Date().toISOString(),
      config: currentConfig,
      projections: currentProjections,
      eventRecords,
    };
    setSnapshots(prev => [snapshot, ...prev]);
    setSaveName("");
    setShowSave(false);
    toast.success(`Saved "${name}"`);
  };

  const handleDeleteConfirm = () => {
    if (!deleteId) return;
    setSnapshots(prev => prev.filter(s => s.id !== deleteId));
    setDeleteId(null);
    toast.success("Snapshot deleted.");
  };

  const handleRenameStart = (s: ProjectionSnapshot) => {
    setEditingId(s.id);
    setEditName(s.name);
  };

  const handleRenameConfirm = (id: string) => {
    if (!editName.trim()) return;
    setSnapshots(prev => prev.map(s => s.id === id ? { ...s, name: editName.trim() } : s));
    setEditingId(null);
  };

  const handleLoad = (snapshot: ProjectionSnapshot) => {
    onLoad(snapshot);
    setOpen(false);
    toast.success(`Loaded "${snapshot.name}"`);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="outline" className="gap-2 hover-lift" size="sm">
        <History className="h-4 w-4" />
        History
        {snapshots.length > 0 && (
          <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0">{snapshots.length}</Badge>
        )}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-display">
              <History className="h-5 w-5 text-primary" />
              Projection History
            </DialogTitle>
            <DialogDescription>
              Save, rename, load and download your projection snapshots.
            </DialogDescription>
          </DialogHeader>

          {/* Save current */}
          <div className="border border-border rounded-lg p-3 bg-muted/30">
            {showSave ? (
              <div className="flex gap-2 items-center">
                <Input
                  value={saveName}
                  onChange={e => setSaveName(e.target.value)}
                  placeholder="Enter snapshot name…"
                  className="h-8 text-sm"
                  onKeyDown={e => e.key === "Enter" && handleSave()}
                  autoFocus
                />
                <Button size="sm" onClick={handleSave} className="gap-1 shrink-0">
                  <Check className="h-3.5 w-3.5" /> Save
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setShowSave(false)} className="shrink-0">
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                variant="default"
                className="gap-2 w-full"
                onClick={() => setShowSave(true)}
                disabled={!currentConfig || currentProjections.length === 0}
              >
                <Plus className="h-4 w-4" />
                Save Current Projection
              </Button>
            )}
          </div>

          {/* Snapshot list */}
          {snapshots.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No saved snapshots yet.</p>
          ) : (
            <div className="space-y-2 mt-1">
              {snapshots.map(snapshot => (
                <div key={snapshot.id} className="border border-border rounded-lg p-3 flex items-center gap-3 hover:bg-muted/20 transition-colors">
                  <div className="flex-1 min-w-0">
                    {editingId === snapshot.id ? (
                      <div className="flex gap-2 items-center">
                        <Input
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          className="h-7 text-sm"
                          onKeyDown={e => {
                            if (e.key === "Enter") handleRenameConfirm(snapshot.id);
                            if (e.key === "Escape") setEditingId(null);
                          }}
                          autoFocus
                        />
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleRenameConfirm(snapshot.id)}>
                          <Check className="h-3.5 w-3.5 text-primary" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setEditingId(null)}>
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <p className="font-semibold text-sm text-foreground truncate">{snapshot.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(snapshot.savedAt).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                          {" · "}{snapshot.config.years}yr · {snapshot.projections[0]?.total.toLocaleString()} → {snapshot.projections[snapshot.projections.length - 1]?.total.toLocaleString()} head
                        </p>
                      </>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={() => handleLoad(snapshot)}>
                      Load
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleRenameStart(snapshot)} title="Rename">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => downloadCsv(snapshot)} title="Download CSV">
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 hover:text-destructive" onClick={() => setDeleteId(snapshot.id)} title="Delete">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Snapshot?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this saved projection. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
