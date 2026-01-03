import { useState } from "react";
import { JsonEditor } from "@/components/json/JsonEditor";
import { JsonDiffViewer } from "@/components/json/JsonDiffViewer";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { exportJson, exportPdfFromJson } from "@/lib/export";

export function ComparisonViewerPage() {
  const [left, setLeft] = useState("{\n  \"env\": \"prod\"\n}");
  const [right, setRight] = useState("{\n  \"env\": \"uat\"\n}");

  const handleExportJson = () => {
    const payload = { left: JSON.parse(left || "{}"), right: JSON.parse(right || "{}") };
    exportJson("comparison.json", payload);
  };

  const handleExportPdf = () => {
    const payload = { left: JSON.parse(left || "{}"), right: JSON.parse(right || "{}") };
    exportPdfFromJson("comparison.pdf", "JSON comparison", payload);
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Analysis</p>
        <h2 className="mt-1 text-xl font-semibold">Standalone Comparison Viewer</h2>
      </header>
      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">PROD JSON</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Label className="text-xs text-muted-foreground">Paste or edit JSON</Label>
            <JsonEditor value={left} onChange={setLeft} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">UAT JSON</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Label className="text-xs text-muted-foreground">Paste or edit JSON</Label>
            <JsonEditor value={right} onChange={setRight} />
          </CardContent>
        </Card>
      </section>
      <section className="grid gap-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,0.6fr)]">
        <JsonDiffViewer left={JSON.parse(left || "{}")} right={JSON.parse(right || "{}") } />
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Export</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Export the current comparison payload as JSON or PDF for offline analysis or to attach to bug reports.
            </p>
            <div className="space-x-2">
              <Button size="sm" variant="outline" onClick={handleExportJson}>
                Export JSON
              </Button>
              <Button size="sm" variant="outline" onClick={handleExportPdf}>
                Export PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
