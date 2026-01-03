import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";

interface HistoryItem {
  id: string | number;
  createdAt?: string;
  timestamp?: string;
  verdict?: string | boolean;
  status?: string;
}

export function DashboardHome() {
  const { toast } = useToast();
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    apiRequest<HistoryItem[]>({ path: "/api/test/history", method: "GET" })
      .then(setHistory)
      .catch((err) => {
        toast({ title: "Could not load history", description: String(err?.message ?? err), variant: "destructive" });
      });
  }, [toast]);

  const totalTests = history.length;
  const totalBulk = 0; // bulk history page will compute real value
  const successCount = history.filter((h) => String(h.verdict ?? h.status).toLowerCase() === "pass").length;
  const failureCount = totalTests - successCount;

  const testsPerDay = history.reduce<Record<string, number>>((acc, item) => {
    const dateRaw = item.createdAt ?? item.timestamp;
    if (!dateRaw) return acc;
    const day = new Date(dateRaw).toISOString().slice(0, 10);
    acc[day] = (acc[day] ?? 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(testsPerDay)
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([day, count]) => ({ day, count }));

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-[hsl(var(--card))] to-[hsl(var(--muted))]">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Total tests run</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{totalTests}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Estimated bulk tests</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{totalBulk}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Success vs Failure</CardTitle>
          </CardHeader>
          <CardContent className="flex items-end justify-between text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Success</p>
              <p className="text-xl font-semibold text-primary">{successCount}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Failure</p>
              <p className="text-xl font-semibold text-destructive">{failureCount}</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Tests per day</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ left: -20, right: 0, top: 10, bottom: 0 }}>
                <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", borderRadius: 8 }} />
                <Area type="monotone" dataKey="count" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.4)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        {/* Failure trends chart could be added with richer history structure */}
      </section>
    </div>
  );
}
