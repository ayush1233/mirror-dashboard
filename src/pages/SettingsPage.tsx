import { FormEvent, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SettingsPage() {
  const store = useAppStore();
  const [backendBaseUrl, setBackendBaseUrl] = useState(store.backendBaseUrl);
  const [defaultHeaderKey, setDefaultHeaderKey] = useState("");
  const [defaultHeaderValue, setDefaultHeaderValue] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const nextHeaders =
      defaultHeaderKey.trim() && defaultHeaderValue
        ? { ...store.defaultHeaders, [defaultHeaderKey.trim()]: defaultHeaderValue }
        : store.defaultHeaders;
    store.updateSettings({ backendBaseUrl, defaultHeaders: nextHeaders });
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Preferences</p>
        <h2 className="mt-1 text-xl font-semibold">Settings</h2>
      </header>
      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Backend connection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="backendBaseUrl">Backend Base URL</Label>
              <Input
                id="backendBaseUrl"
                value={backendBaseUrl}
                onChange={(e) => setBackendBaseUrl(e.target.value)}
              />
              <p className="text-[11px] text-muted-foreground">
                All API requests are sent relative to this URL. Example: http://localhost:8080
              </p>
            </div>
            <div className="space-y-1.5">
              <Label>Stored API token</Label>
              <Input readOnly value={store.apiKey ? "••••••••••" : "Not set"} />
              <p className="text-[11px] text-muted-foreground">Manage the value from the authentication page.</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Default headers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Existing headers</Label>
              <div className="rounded-md border border-border bg-card/60 p-2 text-xs">
                {Object.keys(store.defaultHeaders).length === 0 && (
                  <p className="text-muted-foreground">No default headers saved yet.</p>
                )}
                {Object.entries(store.defaultHeaders).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between gap-2 border-b border-border/60 py-1 last:border-0">
                    <span className="font-mono text-[11px] text-muted-foreground">{k}</span>
                    <span className="truncate text-[11px]">{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Add header</Label>
              <div className="grid grid-cols-[1.1fr_1.4fr_auto] items-center gap-2">
                <Input
                  placeholder="Header name"
                  value={defaultHeaderKey}
                  onChange={(e) => setDefaultHeaderKey(e.target.value)}
                />
                <Input
                  placeholder="Header value"
                  value={defaultHeaderValue}
                  onChange={(e) => setDefaultHeaderValue(e.target.value)}
                />
                <Button type="submit" size="sm" variant="outline">
                  Save
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
