import { NextRequest, NextResponse } from "next/server";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

type FileNode = { name: string; path: string; type: "file" | "directory"; size?: number; children?: FileNode[] };
function scan(dir: string, base: string): FileNode[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((name) => !["node_modules", ".next", ".git"].includes(name)).map((name) => {
    const full = path.join(dir, name); const relative = path.relative(base, full).replace(/\\/g, "/"); const info = statSync(full);
    return info.isDirectory() ? { name, path: relative, type: "directory" as const, children: scan(full, base) } : { name, path: relative, type: "file" as const, size: info.size };
  }).sort((a, b) => a.type === b.type ? a.name.localeCompare(b.name) : a.type === "directory" ? -1 : 1);
}
function count(nodes: FileNode[]): number { return nodes.reduce((total, node) => total + (node.type === "file" ? 1 : count(node.children ?? [])), 0); }
export async function GET(request: NextRequest) {
  const project = request.nextUrl.searchParams.get("project"); const file = request.nextUrl.searchParams.get("file");
  if (!project) return NextResponse.json({ error: "缺少项目名称参数" }, { status: 400 });
  const safeProject = project.replace(/\.\./g, "").replace(/[\\/]/g, ""); const projectDir = path.join(process.cwd(), "output", safeProject);
  if (!existsSync(projectDir)) return NextResponse.json({ error: `项目不存在: ${safeProject}` }, { status: 404 });
  if (file) {
    const safeFile = file.replace(/\.\./g, "").replace(/\\/g, "/"); const fullPath = path.resolve(projectDir, safeFile);
    if (!fullPath.startsWith(path.resolve(projectDir) + path.sep)) return NextResponse.json({ error: "非法路径" }, { status: 403 });
    if (!existsSync(fullPath) || !statSync(fullPath).isFile()) return NextResponse.json({ error: "文件不存在" }, { status: 404 });
    const ext = path.extname(fullPath).slice(1).toLowerCase(); const language: Record<string, string> = { tsx: "typescript", ts: "typescript", jsx: "javascript", js: "javascript", css: "css", html: "html", json: "json", md: "markdown" };
    return NextResponse.json({ name: path.basename(fullPath), path: safeFile, content: readFileSync(fullPath, "utf8"), size: statSync(fullPath).size, language: language[ext] ?? "text" });
  }
  const tree = scan(projectDir, projectDir); return NextResponse.json({ name: project, tree, totalFiles: count(tree) });
}
