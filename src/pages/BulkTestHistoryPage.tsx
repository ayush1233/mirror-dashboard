import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "@/lib/api";
import { JsonViewer } from "@/components/json/JsonViewer";
import { JsonDiffViewer } from "@/components/json/JsonDiffViewer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { exportExcelFromRows, exportJson, exportPdfFromJson } from "@/lib/export";

interface BulkBatchItem {
  id: string | number;
  batchId?: string | number;
  createdAt?: string;
  createdOn?: string;
  testCount?: number;
  passed?: number;
  failed?: number;
}

interface BulkBatchDetail {
  id: string | number;
  createdAt?: string;
  tests?: any[];
}

export function BulkTestHistoryPage() {
  const { toast } = useToast();
  const [batches, setBatches] = useState<BulkBatchItem[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [selected, setSelected] = useState<BulkBatchDetail | null>(null);
  const [selectedTestIndex, setSelectedTestIndex] = useState(0);

  useEffect(() => {
    apiRequest<BulkBatchItem[]>({ path: "/api/test/history/bulk", method: "GET" })
      .then(setBatches)
      .catch((err) => {
        toast({ title: "Could not load bulk history", description: String(err?.message ?? err), variant: "destructive" });
      });
  }, [toast]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return batches;
    return batches.filter((item) => {
      const id = String(item.id ?? item.batchId ?? "").toLowerCase();
      return id.includes(q);
    });
  }, [batches, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  const openDetails = async (id: string | number) => {
    try {
      const detail = await apiRequest<BulkBatchDetail>({ path: `/api/test/history/bulk/${id}`, method: "GET" });
      setSelected(detail);
      setSelectedTestIndex(0);
    } catch (err: any) {
      toast({ title: "Could not load batch", description: String(err?.message ?? err), variant: "destructive" });
    }
  };

  const exportBatchJson = () => {
    if (!selected) return;
    exportJson(`batch-${selected.id}.json`, selected);
  };

  const exportBatchExcel = () => {
    if (!selected?.tests) return;
    const rows = selected.tests.map((test, index) => ({
      index: index + 1,
      verdict: String(test.verdict ?? test.status ?? ""),
      prodUrl: test.request?.prodUrl ?? "",
      uatUrl: test.request?.uatUrl ?? "",
    }));
    exportExcelFromRows(`batch-${selected.id}.xlsx`, rows);
  };

  const exportBatchPdf = () => {
    if (!selected) return;
    exportPdfFromJson(`batch-${selected.id}.pdf`, `Bulk mirror batch ${selected.id}`, selected);
  };

  const currentTest = selected?.tests?.[selectedTestIndex];
  const prodPayload = currentTest?.prod ?? currentTest?.prodResponse;
  const uatPayload = currentTest?.uat ?? currentTest?.uatResponse;

  const totalTests = selected?.tests?.length ?? 0;
  const passed = selected?.tests?.filter((t) => String(t.verdict ?? t.status).toLowerCase() === "pass").length ?? 0;
  const failed = totalTests - passed;
  const passPercent = totalTests ? Math.round((passed / totalTests) * 100) : 0;

  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">History</p>
            <h2 className="mt-1 text-xl font-semibold">Bulk Test History</h2>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="search-bulk" className="text-xs text-muted-foreground">
              Search
            </Label>
            <Input
              id="search-bulk"
              placeholder="Filter by batch ID"
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
            <CardTitle className="text-sm text-muted-foreground">Bulk batches</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="overflow-x-auto rounded-lg border border-border/60">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/40 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2">Batch ID</th>
                    <th className="px-3 py-2">Tests</th>
                    <th className="px-3 py-2">Passed</th>
                    <th className="px-3 py-2">Failed</th>
                    <th className="px-3 py-2">Created On</th>
                    <th className="px-3 py-2 text-right">View</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((item) => {
                    const id = item.batchId ?? item.id;
                    const created = item.createdOn ?? item.createdAt ?? "";
                    return (
                      <tr key={String(id)} className="border-t border-border/40">
                        <td className="px-3 py-2 font-mono text-[11px]">{id}</td>
                        <td className="px-3 py-2 text-[11px]">{item.testCount ?? "-"}</td>
                        <td className="px-3 py-2 text-[11px] text-primary">{item.passed ?? "-"}</td>
                        <td className="px-3 py-2 text-[11px] text-destructive">{item.failed ?? "-"}</td>
                        <td className="px-3 py-2 text-[11px] text-muted-foreground">{created}</td>
                        <td className="px-3 py-2 text-right">
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => openDetails(id ?? "")}
                          >
                            View batch
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
          <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Batch details</p>
              <h3 className="mt-1 text-lg font-semibold">Batch {selected.id}</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {totalTests} tests • {passed} passed • {failed} failed • Pass rate {passPercent}%
              </p>
            </div>
            <div className="space-x-2">
              <Button type="button" size="sm" variant="outline" onClick={exportBatchJson}>
                Export JSON
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={exportBatchExcel}>
                Export Excel
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={exportBatchPdf}>
                Export PDF
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setSelected(null)}>
                Close
              </Button>
            </div>
          </header>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {selected.tests?.map((_, index) => (
              <Button
                key={index}
                type="button"
                size="sm"
                variant={index === selectedTestIndex ? "hero" : "outline"}
                onClick={() => setSelectedTestIndex(index)}
              >
                Test {index + 1}
              </Button>
            ))}
          </div>

          {currentTest && (
            <div className="grid gap-4 md:grid-cols-2">
              <JsonViewer data={prodPayload} title="PROD response" />
              <JsonViewer data={uatPayload} title="UAT response" />
            </div>
          )}
          {currentTest && (
            <div className="grid gap-4 md:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
              <JsonDiffViewer left={prodPayload} right={uatPayload} />
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm text-muted-foreground">Request info</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="max-h-64 overflow-auto rounded-md bg-muted/40 p-3 text-[11px]">
                    {JSON.stringify(currentTest.request ?? {}, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
