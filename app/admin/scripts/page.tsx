"use client";

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
      // TODO: Implement actual script execution
      // For now, simulate the process
      await new Promise((resolve) => setTimeout(resolve, 3000));

      setScripts((prev) =>
        prev.map((script) =>
          script.name === scriptName
            ? {
                ...script,
                status: "success",
                output: [
                  ...script.output,
                  `✅ ${scriptName} başarıyla tamamlandı`,
                  `📂 İşlenen dosyalar: 5`,
                  `⏱️ Süre: 3.2s`,
                ],
              }
            : script
        )
      );
    } catch (error) {
      setScripts((prev) =>
        prev.map((script) =>
          script.name === scriptName
            ? {
                ...script,
                status: "error",
                output: [
                  ...script.output,
                  `❌ ${scriptName} hata aldı: ${error}`,
                ],
              }
            : script
        )
      );
    }
  };

  const runAllScripts = async () => {
    for (const script of scripts) {
      await runScript(script.name);
      await new Promise((resolve) => setTimeout(resolve, 1000));
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
