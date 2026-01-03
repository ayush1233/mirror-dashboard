import ReactJson from "react-json-view";

interface JsonViewerProps {
  data: unknown;
  title?: string;
}

export function JsonViewer({ data, title }: JsonViewerProps) {
  return (
    <div className="space-y-2 rounded-lg border border-border bg-card/80 p-3">
      {title && <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">{title}</p>}
      <div className="max-h-[360px] overflow-auto rounded-md bg-background/60 p-2 text-xs">
        <ReactJson
          src={(data as any) ?? {}}
          name={false}
          theme="harmonic"
          displayDataTypes={false}
          displayObjectSize={false}
          collapsed={2}
        />
      </div>
    </div>
  );
}
