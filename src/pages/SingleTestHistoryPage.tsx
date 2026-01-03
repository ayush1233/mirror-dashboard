import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "@/lib/api";
import { JsonViewer } from "@/components/json/JsonViewer";
import { JsonDiffViewer } from "@/components/json/JsonDiffViewer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { exportJson, exportPdfFromJson } from "@/lib/export";

interface SingleHistoryItem {
  id: string | number;
  createdAt?: string;
  timestamp?: string;
  verdict?: string | boolean;
  status?: string;
  request?: any;
  prod?: any;
  prodResponse?: any;
  uat?: any;
  uatResponse?: any;
}

export function SingleTestHistoryPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<SingleHistoryItem[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [selected, setSelected] = useState<SingleHistoryItem | null>(null);

  useEffect(() => {
    apiRequest<SingleHistoryItem[]>({ path: "/api/test/history", method: "GET" })
      .then(setItems)
      .catch((err) => {
        toast({ title: "Could not load history", description: String(err?.message ?? err), variant: "destructive" });
      });
  }, [toast]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => {
      return (
        String(item.id).toLowerCase().includes(q) ||
        String(item.verdict ?? item.status ?? "").toLowerCase().includes(q)
      );
    });
  }, [items, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  const openDetails = async (id: string | number) => {
    try {
      const detail = await apiRequest<SingleHistoryItem>({ path: `/api/test/history/${id}`, method: "GET" });
      setSelected(detail);
    } catch (err: any) {
      toast({ title: "Could not load test", description: String(err?.message ?? err), variant: "destructive" });
    }
  };

  const clearSelection = () => setSelected(null);

  const exportSelectedJson = () => {
    if (!selected) return;
    exportJson(`test-${selected.id}.json`, selected);
  };

  const exportSelectedPdf = () => {
    if (!selected) return;
    exportPdfFromJson(`test-${selected.id}.pdf`, `Mirror test ${selected.id}`, selected);
  };

  const prodPayload = selected?.prod ?? selected?.prodResponse;
  const uatPayload = selected?.uat ?? selected?.uatResponse;

  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">History</p>
            <h2 className="mt-1 text-xl font-semibold">Single Test History</h2>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="search" className="text-xs text-muted-foreground">
              Search
            </Label>
            <Input
              id="search"
              placeholder="Filter by ID or verdict"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="h-8 w-64"
            />
          </div>
        </header>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Recent tests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="overflow-x-auto rounded-lg border border-border/60">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/40 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2">ID</th>
                    <th className="px-3 py-2">Timestamp</th>
                    <th className="px-3 py-2">Verdict</th>
                    <th className="px-3 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((item) => {
                    const ts = item.createdAt ?? item.timestamp ?? "";
                    const verdict = String(item.verdict ?? item.status ?? "-");
                    return (
                      <tr key={item.id} className="border-t border-border/40">
                        <td className="px-3 py-2 font-mono text-[11px]">{item.id}</td>
                        <td className="px-3 py-2 text-[11px] text-muted-foreground">{ts}</td>
                        <td className="px-3 py-2 text-[11px]">
                          <span
                            className={
                              verdict.toLowerCase() === "pass"
                                ? "text-primary"
                                : verdict.toLowerCase() === "fail"
                                  ? "text-destructive"
                                  : "text-muted-foreground"
                            }
                          >
                            {verdict}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right">
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => openDetails(item.id)}
                          >
                            View result
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <p>
                Page {page} of {totalPages}
              </p>
              <div className="space-x-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {selected && (
        <section className="space-y-4">
          <header className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Details</p>
              <h3 className="mt-1 text-lg font-semibold">Test {selected.id}</h3>
            </div>
            <div className="space-x-2">
              <Button type="button" size="sm" variant="outline" onClick={exportSelectedJson}>
                Export JSON
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={exportSelectedPdf}>
                Export PDF
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={clearSelection}>
                Close
              </Button>
            </div>
          </header>

          <div className="grid gap-4 md:grid-cols-2">
            <JsonViewer data={prodPayload} title="PROD response" />
            <JsonViewer data={uatPayload} title="UAT response" />
          </div>
          <div className="grid gap-4 md:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
            <JsonDiffViewer left={prodPayload} right={uatPayload} />
            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">Request info</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="max-h-64 overflow-auto rounded-md bg-muted/40 p-3 text-[11px]">
                  {JSON.stringify(selected.request ?? {}, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </div>
        </section>
      )}
    </div>
  );
}
