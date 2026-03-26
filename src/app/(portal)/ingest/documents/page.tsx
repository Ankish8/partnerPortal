"use client";

import { Button, Card, Chip } from "@heroui/react";
import {
  FileText,
  Upload,
  File,
  Trash2,
  CheckCircle2,
  Loader2,
} from "lucide-react";

interface DocSource {
  id: string;
  name: string;
  size: string;
  type: string;
  status: "processing" | "completed";
  uploadedAt: string;
}

const mockDocs: DocSource[] = [
  {
    id: "1",
    name: "Product FAQ.pdf",
    size: "2.4 MB",
    type: "PDF",
    status: "completed",
    uploadedAt: "1 hour ago",
  },
  {
    id: "2",
    name: "Pricing Guide 2024.docx",
    size: "890 KB",
    type: "DOCX",
    status: "processing",
    uploadedAt: "5 minutes ago",
  },
];

export default function DocumentsPage() {
  return (
    <div className="mx-auto max-w-4xl px-8 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <FileText className="h-5 w-5 text-amber-600" />
          <h1 className="text-xl font-bold text-foreground">Document Sources</h1>
        </div>
        <p className="text-sm text-muted">
          Upload PDFs, Word docs, and spreadsheets. Content will be extracted and indexed.
        </p>
      </div>

      {/* Upload area */}
      <Card className="mb-6 p-8 border-2 border-dashed border-default text-center cursor-pointer hover:border-accent hover:bg-accent/5 transition-colors">
        <Upload className="mx-auto mb-3 h-10 w-10 text-muted" />
        <p className="text-sm font-medium text-foreground">Drop files here or click to upload</p>
        <p className="mt-1 text-xs text-muted">Supports PDF, DOCX, TXT, CSV, XLSX (max 50MB per file)</p>
        <Button className="mt-4" variant="outline" size="sm">
          <Upload className="h-3.5 w-3.5" />
          Browse Files
        </Button>
      </Card>

      {/* Document list */}
      <div className="space-y-3">
        {mockDocs.map((doc) => (
          <Card key={doc.id} className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
                <File className="h-4.5 w-4.5 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                <div className="mt-1 flex items-center gap-3 text-xs text-muted">
                  <span>{doc.type}</span>
                  <span>{doc.size}</span>
                  <span>Uploaded {doc.uploadedAt}</span>
                </div>
              </div>
              <Chip
                size="sm"
                variant="soft"
                color={doc.status === "completed" ? "success" : "warning"}
              >
                {doc.status === "completed" ? (
                  <><CheckCircle2 className="h-3 w-3" /> Indexed</>
                ) : (
                  <><Loader2 className="h-3 w-3 animate-spin" /> Processing</>
                )}
              </Chip>
              <Button size="sm" variant="ghost" isIconOnly>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
