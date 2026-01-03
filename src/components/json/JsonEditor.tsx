import Editor from "@monaco-editor/react";
import { useState } from "react";

interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  height?: string;
}

export function JsonEditor({ value, onChange, height = "260px" }: JsonEditorProps) {
  const [internal, setInternal] = useState(value);

  const handleChange = (value?: string) => {
    const next = value ?? "";
    setInternal(next);
    onChange(next);
  };

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card/80">
      <Editor
        height={height}
        language="json"
        theme="vs-dark"
        value={internal}
        onChange={handleChange}
        options={{
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap: "on",
          fontSize: 13,
        }}
      />
    </div>
  );
}
