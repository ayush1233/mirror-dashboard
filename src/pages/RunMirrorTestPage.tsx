import { FormEvent, useState } from "react";
import { apiRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { JsonEditor } from "@/components/json/JsonEditor";
import { JsonViewer } from "@/components/json/JsonViewer";
import { JsonDiffViewer } from "@/components/json/JsonDiffViewer";
import { useToast } from "@/hooks/use-toast";

interface HeaderRow {
  id: number;
  key: string;
  value: string;
}

export function RunMirrorTestPage() {
  const { toast } = useToast();
  const [prodUrl, setProdUrl] = useState("");
  const [uatUrl, setUatUrl] = useState("");
  const [method, setMethod] = useState<"GET" | "POST">("GET");
  const [headers, setHeaders] = useState<HeaderRow[]>([{ id: 1, key: "", value: "" }]);
  const [body, setBody] = useState("{\n  \"example\": true\n}");
  const [loading, setLoading] = useState(false);
  const [prodResponse, setProdResponse] = useState<any>();
  const [uatResponse, setUatResponse] = useState<any>();

  const handleAddHeader = () => {
    setHeaders((rows) => [...rows, { id: Date.now(), key: "", value: "" }]);
  };

  const handleHeaderChange = (id: number, field: "key" | "value", value: string) => {
    setHeaders((rows) => rows.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const handleRemoveHeader = (id: number) => {
    setHeaders((rows) => rows.filter((r) => r.id !== id));
  };

  const effectiveHeaders = headers.reduce<Record<string, string>>((acc, row) => {
    if (row.key.trim()) acc[row.key.trim()] = row.value;
    return acc;
  }, {});

  const resetForm = () => {
    setProdUrl("");
    setUatUrl("");
    setMethod("GET");
    setHeaders([{ id: 1, key: "", value: "" }]);
    setBody("{\n  \"example\": true\n}");
    setProdResponse(undefined);
    setUatResponse(undefined);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!prodUrl || !uatUrl) {
      toast({ title: "Missing URLs", description: "Please provide both PROD and UAT URLs.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      if (method === "GET") {
        const query = new URLSearchParams({ prodUrl, uatUrl }).toString();
        const result = await apiRequest<any>({ path: `/api/test/mirror?${query}`, method: "GET", headers: effectiveHeaders });
        setProdResponse(result?.prod ?? result?.prodResponse ?? result);
        setUatResponse(result?.uat ?? result?.uatResponse ?? result);
      } else {
        const parsedBody = body.trim() ? JSON.parse(body) : {};
        const result = await apiRequest<any>({
          path: "/api/test/mirror",
          method: "POST",
          headers: effectiveHeaders,
          body: { prodUrl, uatUrl, ...parsedBody },
        });
        setProdResponse(result?.prod ?? result?.prodResponse ?? result);
        setUatResponse(result?.uat ?? result?.uatResponse ?? result);
      }
      toast({ title: "Test executed", description: "Mirror test completed successfully." });
    } catch (err: any) {
      toast({
        title: "Mirror test failed",
        description: String(err?.message ?? err),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportAsJson = () => {
    const payload = { prod: prodResponse, uat: uatResponse };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mirror-test-result.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const verdict = JSON.stringify(prodResponse) === JSON.stringify(uatResponse) ? "Pass" : "Fail";

  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Runner</p>
          <h2 className="mt-1 text-xl font-semibold">Run Mirror Test</h2>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Request configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="prodUrl">PROD URL</Label>
                  <Input
                    id="prodUrl"
                    placeholder="https://prod.example.com/api/resource"
                    value={prodUrl}
                    onChange={(e) => setProdUrl(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="uatUrl">UAT URL</Label>
                  <Input
                    id="uatUrl"
                    placeholder="https://uat.example.com/api/resource"
                    value={uatUrl}
                    onChange={(e) => setUatUrl(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-[minmax(0,0.6fr)_minmax(0,1.4fr)]">
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label>HTTP method</Label>
                    <div className="inline-flex rounded-full border border-border bg-card p-1 text-xs">
                      {(["GET", "POST"] as const).map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setMethod(m)}
                          className={`rounded-full px-3 py-1 ${
                            method === m ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Headers</Label>
                      <Button type="button" variant="ghost" size="sm" onClick={handleAddHeader}>
                        Add header
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {headers.map((row) => (
                        <div key={row.id} className="grid grid-cols-[1.1fr_1.4fr_auto] items-center gap-2">
                          <Input
                            placeholder="Header name"
                            value={row.key}
                            onChange={(e) => handleHeaderChange(row.id, "key", e.target.value)}
                          />
                          <Input
                            placeholder="Header value"
                            value={row.value}
                            onChange={(e) => handleHeaderChange(row.id, "value", e.target.value)}
                          />
                          <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveHeader(row.id)}>
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" variant="hero" disabled={loading}>
                      {loading ? "Running..." : "Run Test"}
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Reset Form
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>JSON body (POST only)</Label>
                  <JsonEditor value={body} onChange={setBody} height="260px" />
                  <p className="text-[11px] text-muted-foreground">
                    The body is merged with URLs when sending POST /api/test/mirror. For GET requests, only query parameters
                    are used.
                  </p>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <JsonViewer data={prodResponse} title="PROD response" />
        <JsonViewer data={uatResponse} title="UAT response" />
      </section>

      {(prodResponse || uatResponse) && (
        <section className="grid gap-4 md:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
          <JsonDiffViewer left={prodResponse} right={uatResponse} />
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Verdict & Export</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground">Verdict</p>
                <p
                  className={`mt-1 text-lg font-semibold ${
                    verdict === "Pass" ? "text-primary" : "text-destructive"
                  }`}
                >
                  {verdict}
                </p>
              </div>
              <div className="space-x-2">
                <Button type="button" size="sm" variant="outline" onClick={exportAsJson}>
                  Export as JSON
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}
