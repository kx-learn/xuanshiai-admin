import { NextResponse } from "next/server";
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";

interface Project {
  id: string;
  name: string;
  mode: string;
  sourceUrl?: string;
  sourceImageName?: string;
  createdAt: string;
  completedAt?: string;
  status: string;
  outputPath: string;
  pageCount?: number;
  componentCount?: number;
}

export async function GET() {
  try {
    const outputDir = join(process.cwd(), "output");
    const registryPath = join(outputDir, "projects.json");

    // Read JSON registry
    let registry: Project[] = [];
    if (existsSync(registryPath)) {
      try {
        registry = JSON.parse(readFileSync(registryPath, "utf-8"));
      } catch { registry = []; }
    }

    // Also scan filesystem for any directories not in registry
    const registeredNames = new Set(registry.map((p) => p.name));
    if (existsSync(outputDir)) {
      const dirs = readdirSync(outputDir).filter((name) => {
        if (name === "projects.json") return false;
        const p = join(outputDir, name);
        try { return statSync(p).isDirectory(); } catch { return false; }
      });

      for (const dirName of dirs) {
        if (!registeredNames.has(dirName)) {
          registry.push({
            id: `fs-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            name: dirName,
            mode: "unknown",
            createdAt: new Date(
              statSync(join(outputDir, dirName)).birthtimeMs || Date.now()
            ).toISOString(),
            status: "completed",
            outputPath: `output/${dirName}/`,
          });
        }
      }
    }

    // Sort by createdAt descending
    registry.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json(registry);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "加载失败" },
      { status: 500 }
    );
  }
}
