import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/store/useAppStore";
import { toast } from "@/hooks/use-toast";

export function AuthPage() {
  const [email, setEmail] = useState("");
  const [apiKey, setApiKey] = useState("");
  const setAuthenticated = useAppStore((s) => s.setAuthenticated);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    updateSettings({ apiKey });
    setAuthenticated(true);
    toast({ title: "Signed in", description: "Your API token has been stored locally." });
    navigate("/dashboard", { replace: true });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[hsl(var(--background))] to-[hsl(var(--card))] px-4">
      <div className="w-full max-w-md rounded-2xl border border-border/80 bg-card/80 p-8 shadow-[var(--shadow-soft)] backdrop-blur-md">
        <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Shadow Mirror</p>
        <h1 className="mt-3 text-2xl font-semibold">Sign in to dashboard</h1>
        <p className="mt-2 text-xs text-muted-foreground">
          Authentication is UI-only. Your API token is stored in localStorage and used for all backend requests.
        </p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email (for display only)</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="token">API Key / Token</Label>
            <Input
              id="token"
              type="password"
              placeholder="Paste your token (optional)"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              autoComplete="off"
            />
          </div>
          <Button type="submit" className="w-full" variant="hero">
            Continue to Dashboard
          </Button>
        </form>
      </div>
    </main>
  );
}
