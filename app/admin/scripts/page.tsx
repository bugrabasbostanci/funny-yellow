"use client";

export const runtime = "edge";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Play,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface ScriptStatus {
  name: string;
  status: "idle" | "running" | "success" | "error";
  output: string[];
}

export default function AdminScripts() {
  const [scripts, setScripts] = useState<ScriptStatus[]>([
    {
      name: "optimize-stickers",
      status: "idle",
      output: [],
    },
    {
      name: "upload-stickers",
      status: "idle",
      output: [],
    },
    {
      name: "convert-webp-to-png",
      status: "idle",
      output: [],
    },
  ]);

  const runScript = async (scriptName: string) => {
    // Set script as running
    setScripts((prev) =>
      prev.map((script) =>
        script.name === scriptName
          ? {
              ...script,
              status: "running",
              output: [`${scriptName} başlatılıyor...`],
            }
          : script
      )
    );

    try {
      const response = await fetch("/api/admin/run-script", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ script: scriptName }),
      });

      if (!response.ok) {
        throw new Error("Failed to start script");
      }

      // Handle Server-Sent Events
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response body");
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));

              setScripts((prev) =>
                prev.map((script) =>
                  script.name === scriptName
                    ? {
                        ...script,
                        status:
                          data.type === "end"
                            ? data.success
                              ? "success"
                              : "error"
                            : "running",
                        output: [...script.output, data.message || data.data],
                      }
                    : script
                )
              );

              if (data.type === "end") {
                break;
              }
            } catch {
              console.warn("Failed to parse SSE data:", line);
            }
          }
        }
      }
    } catch (error) {
      setScripts((prev) =>
        prev.map((script) =>
          script.name === scriptName
            ? {
                ...script,
                status: "error",
                output: [
                  ...script.output,
                  `❌ ${scriptName} hata aldı: ${
                    error instanceof Error ? error.message : "Bilinmeyen hata"
                  }`,
                ],
              }
            : script
        )
      );
    }
  };

  const runAllScripts = async () => {
    try {
      const scriptNames = scripts.map((s) => s.name);

      // Set all scripts to initial state
      setScripts((prev) =>
        prev.map((script) => ({
          ...script,
          status: "idle",
          output: [],
        }))
      );

      const response = await fetch("/api/admin/process-files", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ scripts: scriptNames }),
      });

      if (!response.ok) {
        throw new Error("Failed to start pipeline");
      }

      // Handle Server-Sent Events for pipeline
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response body");
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === "step_start") {
                // Mark current script as running
                setScripts((prev) =>
                  prev.map((script) =>
                    script.name === data.script
                      ? {
                          ...script,
                          status: "running",
                          output: [`${data.script} başlatılıyor...`],
                        }
                      : script
                  )
                );
              } else if (
                data.type === "step_output" ||
                data.type === "step_error"
              ) {
                // Add output to current script
                setScripts((prev) =>
                  prev.map((script) =>
                    script.name === data.script
                      ? { ...script, output: [...script.output, data.data] }
                      : script
                  )
                );
              } else if (data.type === "step_complete") {
                // Mark script as complete
                setScripts((prev) =>
                  prev.map((script) =>
                    script.name === data.script
                      ? {
                          ...script,
                          status: data.success ? "success" : "error",
                          output: [...script.output, data.message],
                        }
                      : script
                  )
                );
              }

              if (data.type === "pipeline_complete") {
                break;
              }
            } catch {
              console.warn("Failed to parse pipeline SSE data:", line);
            }
          }
        }
      }
    } catch (error) {
      console.error("Pipeline error:", error);
      toast.error("Pipeline hata aldı", {
        description: error instanceof Error ? error.message : "Bilinmeyen hata",
      });
    }
  };

  const getStatusIcon = (status: ScriptStatus["status"]) => {
    switch (status) {
      case "running":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Play className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: ScriptStatus["status"]) => {
    switch (status) {
      case "running":
        return "border-blue-200 bg-blue-50";
      case "success":
        return "border-green-200 bg-green-50";
      case "error":
        return "border-red-200 bg-red-50";
      default:
        return "border-gray-200 bg-white";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Admin Dashboard&apos;a Dön
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Script Yönetimi
          </h1>
          <p className="text-gray-600">
            Sticker işleme script&apos;lerini çalıştır
          </p>
        </div>

        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Toplu İşlem</CardTitle>
              <CardDescription>
                Tüm script&apos;leri sırayla çalıştır (optimize → upload →
                convert)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={runAllScripts}
                disabled={scripts.some((s) => s.status === "running")}
                size="lg"
                className="w-full"
              >
                <Play className="h-4 w-4 mr-2" />
                Tüm Script&apos;leri Çalıştır
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {scripts.map((script) => (
            <Card key={script.name} className={getStatusColor(script.status)}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {getStatusIcon(script.status)}
                      npm run {script.name}
                    </CardTitle>
                    <CardDescription>
                      {script.name === "optimize-stickers" &&
                        "Source dosyalarını 512x512 WebP'ye dönüştürür"}
                      {script.name === "upload-stickers" &&
                        "WebP dosyalarını Supabase'e yükler ve metadata ekler"}
                      {script.name === "convert-webp-to-png" &&
                        "WebP dosyalarını PNG'ye dönüştürür (WhatsApp Web için)"}
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => runScript(script.name)}
                    disabled={script.status === "running"}
                    variant="outline"
                  >
                    {script.status === "running" ? "Çalışıyor..." : "Çalıştır"}
                  </Button>
                </div>
              </CardHeader>

              {script.output.length > 0 && (
                <CardContent>
                  <div className="bg-gray-900 text-green-400 p-3 rounded-md font-mono text-sm max-h-40 overflow-y-auto">
                    {script.output.map((line, i) => (
                      <div key={i}>{line}</div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>İşlem Sırası</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">
                    1
                  </span>
                  <span>
                    <strong>optimize-stickers:</strong> Source klasöründeki
                    dosyaları WebP&apos;ye dönüştürür
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">
                    2
                  </span>
                  <span>
                    <strong>upload-stickers:</strong> WebP dosyalarını
                    Supabase&apos;e yükler
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">
                    3
                  </span>
                  <span>
                    <strong>convert-webp-to-png:</strong> WhatsApp Web
                    uyumluluğu için PNG oluşturur
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
