import { useMemo } from "react";
import { diff as jsonDiff } from "jsondiffpatch";

interface JsonDiffViewerProps {
  left: unknown;
  right: unknown;
}

export function JsonDiffViewer({ left, right }: JsonDiffViewerProps) {
  const diff = useMemo(() => {
    try {
      return jsonDiff(left, right) ?? {};
    } catch {
      return { error: "Unable to compute diff for given values" };
    }
  }, [left, right]);

  return (
    <div className="space-y-2 rounded-lg border border-border bg-card/80 p-3">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Inline JSON diff</p>
      <pre className="max-h-[360px] overflow-auto rounded-md bg-background/70 p-3 text-xs leading-relaxed">
        {JSON.stringify(diff, null, 2)}
      </pre>
    </div>
  );
}
