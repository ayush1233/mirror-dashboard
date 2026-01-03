import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

export type BulkMethod = "GET" | "POST";

interface BulkHeaderRow {
  id: number;
  key: string;
  value: string;
}

export interface BulkTestCase {
  id: number;
  name: string;
  prodUrl: string;
  uatUrl: string;
  method: BulkMethod;
  headers: BulkHeaderRow[];
  body: string;
}

interface BulkResult {
  id: number;
  status: "pending" | "success" | "failed";
  message?: string;
  progress: number;
}

interface BulkTemplate {
  id: number;
  name: string;
  cases: Omit<BulkTestCase, "id">[];
}

const TEMPLATES_KEY = "shadow-bulk-templates";

function loadTemplates(): BulkTemplate[] {
  try {
    const raw = localStorage.getItem(TEMPLATES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as BulkTemplate[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveTemplates(templates: BulkTemplate[]) {
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
}

export function BulkTestRunnerPage() {
  const { toast } = useToast();
  const [rows, setRows] = useState<BulkTestCase[]>([{
    id: 1,
    name: "",
    prodUrl: "",
    uatUrl: "",
    method: "GET",
    headers: [{ id: 1, key: "", value: "" }],
    body: "{\n  \"example\": true\n}",
  }]);
  const [results, setResults] = useState<BulkResult[]>([]);
  const [running, setRunning] = useState(false);
  const [templates, setTemplates] = useState<BulkTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [newTemplateName, setNewTemplateName] = useState("");

  useEffect(() => {
    setTemplates(loadTemplates());
  }, []);

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: "",
        prodUrl: "",
        uatUrl: "",
        method: "GET",
        headers: [{ id: Date.now() + 1, key: "", value: "" }],
        body: "{\n  \"example\": true\n}",
      },
    ]);
  };

  const removeRow = (id: number) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
    setResults((prev) => prev.filter((r) => r.id !== id));
  };

  const updateRow = (id: number, field: keyof BulkTestCase, value: any) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const updateHeader = (rowId: number, headerId: number, field: "key" | "value", value: string) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === rowId
          ? {
              ...row,
              headers: row.headers.map((h) => (h.id === headerId ? { ...h, [field]: value } : h)),
            }
          : row,
      ),
    );
  };

  const addHeader = (rowId: number) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === rowId
          ? {
              ...row,
              headers: [...row.headers, { id: Date.now(), key: "", value: "" }],
            }
          : row,
      ),
    );
  };

  const removeHeader = (rowId: number, headerId: number) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === rowId
          ? {
              ...row,
              headers: row.headers.filter((h) => h.id !== headerId),
            }
          : row,
      ),
    );
  };

  const runAllTests = async () => {
    if (!rows.length) {
      toast({ title: "No test cases", description: "Add at least one test case to run.", variant: "destructive" });
      return;
    }

    setRunning(true);
    const initialResults: BulkResult[] = rows.map((r) => ({ id: r.id, status: "pending", progress: 10 }));
    setResults(initialResults);

    try {
      const payload = rows.map((row) => ({
        name: row.name,
        prodUrl: row.prodUrl,
        uatUrl: row.uatUrl,
        method: row.method,
        headers: row.headers.reduce<Record<string, string>>((acc, h) => {
          if (h.key.trim()) acc[h.key.trim()] = h.value;
          return acc;
        }, {}),
        body: row.body ? JSON.parse(row.body) : undefined,
      }));

      const response = await apiRequest<any>({
        path: "/api/test/mirror/bulk",
        method: "POST",
        body: payload as any,
      });

      const resultArray: any[] = Array.isArray(response) ? response : response?.results ?? [];

      setResults((prev) =>
        prev.map((r, index) => {
          const match = resultArray[index] ?? resultArray.find((x: any) => x?.id === r.id || x?.name === rows[index]?.name);
          const ok = match ? !!(match.success ?? match.passed ?? match.ok) : true;
          return {
            ...r,
            status: ok ? "success" : "failed",
            message: match?.message,
            progress: 100,
          };
        }),
      );

      toast({ title: "Bulk run complete", description: "Mirror bulk test finished for all cases." });
    } catch (err: any) {
      setResults((prev) => prev.map((r) => ({ ...r, status: "failed", progress: 100, message: String(err?.message ?? err) })));
      toast({
        title: "Bulk run failed",
        description: String(err?.message ?? err),
        variant: "destructive",
      });
    } finally {
      setRunning(false);
    }
  };

  const handleUploadJson = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const list: any[] = Array.isArray(parsed) ? parsed : parsed?.cases ?? [];
        if (!Array.isArray(list) || !list.length) {
          toast({ title: "Invalid template", description: "Uploaded JSON does not contain test cases.", variant: "destructive" });
          return;
        }

        const mapped: BulkTestCase[] = list.map((item, index) => ({
          id: Date.now() + index,
          name: item.name ?? `Case ${index + 1}`,
          prodUrl: item.prodUrl ?? "",
          uatUrl: item.uatUrl ?? "",
          method: (item.method === "POST" ? "POST" : "GET") as BulkMethod,
          headers: Object.entries(item.headers ?? {}).map(([key, value], i) => ({
            id: Date.now() + index * 100 + i,
            key,
            value: String(value ?? ""),
          })),
          body: item.body ? JSON.stringify(item.body, null, 2) : "{\n  \"example\": true\n}",
        }));

        setRows(mapped);
        setResults([]);
        toast({ title: "Template loaded", description: `Loaded ${mapped.length} test case(s) from file.` });
      } catch (e: any) {
        toast({ title: "Invalid JSON", description: String(e?.message ?? e), variant: "destructive" });
      }
    };
    reader.readAsText(file);
  };

  const saveCurrentAsTemplate = () => {
    if (!rows.length) {
      toast({ title: "Nothing to save", description: "Add at least one row before saving a template.", variant: "destructive" });
      return;
    }
    if (!newTemplateName.trim()) {
      toast({ title: "Name required", description: "Enter a template name before saving.", variant: "destructive" });
      return;
    }

    const next: BulkTemplate[] = [
      ...templates,
      {
        id: Date.now(),
        name: newTemplateName.trim(),
        cases: rows.map(({ id, ...rest }) => rest),
      },
    ];

    setTemplates(next);
    saveTemplates(next);
    setNewTemplateName("");
    toast({ title: "Template saved", description: "Bulk test template saved locally." });
  };

  const applyTemplate = (id: string) => {
    setSelectedTemplateId(id);
    const template = templates.find((t) => String(t.id) === id);
    if (!template) return;

    const mapped: BulkTestCase[] = template.cases.map((c, index) => ({
      id: Date.now() + index,
      name: c.name,
      prodUrl: c.prodUrl,
      uatUrl: c.uatUrl,
      method: c.method,
      headers: c.headers.map((h, i) => ({ ...h, id: Date.now() + index * 100 + i })),
      body: c.body,
    }));

    setRows(mapped);
    setResults([]);
    toast({ title: "Template applied", description: `Loaded ${mapped.length} test case(s) from template.` });
  };

  const deleteTemplate = (id: string) => {
    const next = templates.filter((t) => String(t.id) !== id);
    setTemplates(next);
    saveTemplates(next);
    if (selectedTemplateId === id) {
      setSelectedTemplateId("");
    }
    toast({ title: "Template deleted", description: "Template removed from local storage." });
  };

  const exportCasesAsJson = () => {
    const payload = rows.map((row) => ({
      name: row.name,
      prodUrl: row.prodUrl,
      uatUrl: row.uatUrl,
      method: row.method,
      headers: row.headers.reduce<Record<string, string>>((acc, h) => {
        if (h.key.trim()) acc[h.key.trim()] = h.value;
        return acc;
      }, {}),
      body: row.body ? JSON.parse(row.body) : undefined,
    }));

    const blob = new Blob([JSON.stringify({ cases: payload }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bulk-mirror-template.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Runner</p>
            <h2 className="mt-1 text-xl font-semibold">Bulk Test Runner</h2>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <div className="space-x-2">
              <Label className="text-[11px] text-muted-foreground">Templates</Label>
              <select
                className="rounded-md border border-input bg-background px-2 py-1 text-xs"
                value={selectedTemplateId}
                onChange={(e) => applyTemplate(e.target.value)}
              >
                <option value="">Select template</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              {selectedTemplateId && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteTemplate(selectedTemplateId)}
                >
                  Delete
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Input
                placeholder="New template name"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                className="h-8 w-40"
              />
              <Button type="button" size="sm" variant="outline" onClick={saveCurrentAsTemplate}>
                Save template
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Input type="file" accept="application/json" className="h-8 w-48" onChange={handleUploadJson} />
              <Button type="button" size="sm" variant="outline" onClick={exportCasesAsJson}>
                Export JSON
              </Button>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Test cases</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="overflow-x-auto rounded-lg border border-border/60">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/40 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">PROD URL</th>
                    <th className="px-3 py-2">UAT URL</th>
                    <th className="px-3 py-2">Method</th>
                    <th className="px-3 py-2">Headers</th>
                    <th className="px-3 py-2">Body (JSON)</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const result = results.find((r) => r.id === row.id);
                    return (
                      <tr key={row.id} className="border-t border-border/40 align-top">
                        <td className="px-3 py-2">
                          <Input
                            value={row.name}
                            onChange={(e) => updateRow(row.id, "name", e.target.value)}
                            placeholder="Case name"
                            className="h-8"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <Input
                            value={row.prodUrl}
                            onChange={(e) => updateRow(row.id, "prodUrl", e.target.value)}
                            placeholder="https://prod..."
                            className="h-8"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <Input
                            value={row.uatUrl}
                            onChange={(e) => updateRow(row.id, "uatUrl", e.target.value)}
                            placeholder="https://uat..."
                            className="h-8"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <select
                            className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                            value={row.method}
                            onChange={(e) => updateRow(row.id, "method", e.target.value as BulkMethod)}
                          >
                            <option value="GET">GET</option>
                            <option value="POST">POST</option>
                          </select>
                        </td>
                        <td className="px-3 py-2 min-w-[180px]">
                          <div className="space-y-1">
                            {row.headers.map((h) => (
                              <div key={h.id} className="flex gap-1">
                                <Input
                                  placeholder="Key"
                                  value={h.key}
                                  onChange={(e) => updateHeader(row.id, h.id, "key", e.target.value)}
                                  className="h-7 text-[11px]"
                                />
                                <Input
                                  placeholder="Value"
                                  value={h.value}
                                  onChange={(e) => updateHeader(row.id, h.id, "value", e.target.value)}
                                  className="h-7 text-[11px]"
                                />
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 text-[11px]"
                  onClick={() => removeHeader(row.id, h.id)}
                >
                                  ×
                                </Button>
                              </div>
                            ))}
                            <Button type="button" size="sm" variant="ghost" onClick={() => addHeader(row.id)}>
                              + Add
                            </Button>
                          </div>
                        </td>
                        <td className="px-3 py-2 min-w-[180px]">
                          <textarea
                            className="min-h-[72px] w-full rounded-md border border-input bg-background px-2 py-1 text-[11px] font-mono"
                            value={row.body}
                            onChange={(e) => updateRow(row.id, "body", e.target.value)}
                          />
                        </td>
                        <td className="px-3 py-2 w-40">
                          <div className="space-y-1">
                            <Progress value={result?.progress ?? 0} className="h-1.5" />
                            <p className="text-[11px] text-muted-foreground">
                              {result?.status === "success" && "Success"}
                              {result?.status === "failed" && "Failed"}
                              {!result && "Pending"}
                            </p>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-right">
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            disabled={running}
                            onClick={() => removeRow(row.id)}
                          >
                            Remove
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Button type="button" variant="outline" size="sm" onClick={addRow}>
                Add row
              </Button>
              <Button type="button" variant="hero" size="sm" disabled={running} onClick={runAllTests}>
                {running ? "Running..." : "Run All Tests"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
