import { NextRequest, NextResponse } from "next/server";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type GenerateRequest = { projectName?: string; mode?: "url" | "image"; url?: string };

function sanitizeFolderName(name: string) {
  return name.trim().replace(/[^a-z0-9\u4e00-\u9fff-_]+/gi, "-").replace(/^-|-$/g, "") || "project";
}

function pageTemplate(title: string, sourceUrl?: string) {
  const escapedTitle = title.replace(/[<&>\"]/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "\"": "&quot;" })[char] ?? char);
  return `export default function GeneratedPage() {\n  return (\n    <main style={{ padding: 48, fontFamily: "Arial, sans-serif" }}>\n      <h1>${escapedTitle}</h1>\n      <p>Generated from ${sourceUrl ?? "uploaded design"}.</p>\n    </main>\n  );\n}\n`;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as GenerateRequest;
    const projectName = body.projectName?.trim();
    const mode = body.mode === "image" ? "image" : "url";
    if (!projectName) return NextResponse.json({ error: "项目名称不能为空" }, { status: 400 });
    if (mode === "url" && body.url) {
      try { new URL(body.url); } catch { return NextResponse.json({ error: "请输入有效的网址" }, { status: 400 }); }
    }

    const name = sanitizeFolderName(projectName);
    const outputDir = join(process.cwd(), "output");
    const projectDir = join(outputDir, name);
    const registryPath = join(outputDir, "projects.json");
    if (existsSync(projectDir)) return NextResponse.json({ error: `项目 "${name}" 已存在` }, { status: 409 });

    mkdirSync(projectDir, { recursive: true });
    writeFileSync(join(projectDir, "page.tsx"), pageTemplate(projectName, body.url), "utf8");
    writeFileSync(join(projectDir, "README.md"), `# ${projectName}\n\n生成方式：${mode}\n`, "utf8");

    let registry: unknown[] = [];
    if (existsSync(registryPath)) {
      try { registry = JSON.parse(readFileSync(registryPath, "utf8")); } catch { registry = []; }
    }
    const project = { id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`, name, displayName: projectName, mode, sourceUrl: body.url, createdAt: new Date().toISOString(), completedAt: new Date().toISOString(), status: "completed", outputPath: `output/${name}/`, pageCount: 1, componentCount: 1 };
    registry.push(project);
    writeFileSync(registryPath, JSON.stringify(registry, null, 2), "utf8");
    return NextResponse.json({ success: true, project });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "生成失败" }, { status: 500 });
  }
}
