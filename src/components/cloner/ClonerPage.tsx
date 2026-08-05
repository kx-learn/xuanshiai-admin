"use client";

import { useState, useCallback, useEffect } from "react";
import { Wand, Globe, ImageIcon, Code, Rocket, Loader2, CheckCircle2, XCircle, ExternalLink, FolderOpen } from "lucide-react";
import { Header } from "./Header";
import { UrlInput } from "./UrlInput";
import { ImageUpload } from "./ImageUpload";
import { ProjectGrid } from "./ProjectGrid";
import { FileBrowser } from "./FileBrowser";
import { cn } from "@/lib/utils";
import type { Project, ProjectMode } from "@/types/project";

function isValidUrl(str: string): boolean {
  if (!str) return false;
  try { const url = new URL(str); return url.protocol === "http:" || url.protocol === "https:"; } catch { return false; }
}

type GenerateStatus = "idle" | "loading" | "success" | "error";

export function ClonerPage() {
  const [activeTab, setActiveTab] = useState<ProjectMode>("url");
  const [projectName, setProjectName] = useState("");
  const [urlValue, setUrlValue] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [status, setStatus] = useState<GenerateStatus>("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [lastProject, setLastProject] = useState<Project | null>(null);
  const [browseProject, setBrowseProject] = useState<string | null>(null);

  // 加载项目列表
  const loadProjects = useCallback(() => {
    fetch("/api/projects")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setProjects(data);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => { loadProjects(); }, [loadProjects]);

  const canGenerate = projectName.trim().length > 0 && (activeTab === "url" ? isValidUrl(urlValue) : imageFile !== null);

  const handleGenerate = useCallback(async () => {
    if (!canGenerate || status === "loading") return;

    setStatus("loading");
    setStatusMessage("正在生成项目...");
    setLastProject(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName: projectName.trim(),
          mode: activeTab,
          url: activeTab === "url" ? urlValue : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setStatusMessage(data.error ?? "生成失败，请重试");
        return;
      }

      setStatus("success");
      setStatusMessage(`"${projectName}" 生成成功！`);
      setLastProject(data.project as Project);

      // 刷新项目列表
      loadProjects();

      // 清空表单
      setProjectName("");
      setUrlValue("");
      setImageFile(null);
    } catch {
      setStatus("error");
      setStatusMessage("网络错误，请检查服务是否运行");
    }
  }, [canGenerate, status, projectName, activeTab, urlValue, loadProjects]);

  const handleDelete = useCallback((id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* ====== 动画背景 ====== */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.25),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_80%_80%,rgba(168,85,247,0.15),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_30%_at_20%_70%,rgba(236,72,153,0.1),transparent)]" />
        <div className="animate-blob-1 absolute -left-32 top-20 h-[500px] w-[500px] rounded-full bg-indigo-600/15 blur-[100px]" />
        <div className="animate-blob-2 absolute right-0 top-1/3 h-[400px] w-[400px] rounded-full bg-purple-600/10 blur-[100px]" />
        <div className="animate-blob-3 absolute bottom-0 left-1/3 h-[350px] w-[350px] rounded-full bg-pink-600/8 blur-[100px]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "32px 32px"
        }} />
      </div>

      <Header />

      {/* ====== Hero ====== */}
      <section className="relative z-10 flex min-h-[55vh] flex-col items-center justify-center px-6 pt-24 pb-8">
        <div className="animate-fade-in mb-8 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/5 backdrop-blur-sm px-4 py-1.5">
          <div className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-400" />
          </div>
          <span className="text-xs font-medium text-indigo-300">URL 克隆 · 图片生成 · AI 驱动 · 秒级出码</span>
        </div>

        <h1 className="animate-fade-in-up max-w-3xl text-center text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
          <span className="gradient-text">AI 网站克隆器</span>
        </h1>

        <p className="animate-fade-in-up stagger-1 mt-6 max-w-xl text-center text-base text-white/40 sm:text-lg">
          输入网址自动克隆网站，或上传截图生成页面，产出 Next.js 源代码
        </p>

        <div className="animate-fade-in-up stagger-2 mt-8 flex flex-wrap items-center justify-center gap-3">
          {[
            { icon: Globe, text: "网址克隆" },
            { icon: ImageIcon, text: "图片生成" },
            { icon: Code, text: "Next.js 16" },
            { icon: Rocket, text: "一键部署" },
          ].map(({ icon: Icon, text }) => (
            <span key={text} className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm px-3.5 py-1.5 text-xs text-white/50">
              <Icon className="h-3 w-3" />
              {text}
            </span>
          ))}
        </div>
      </section>

      {/* ====== 工具卡片 ====== */}
      <section className="relative z-10 px-6 pb-8">
        <div className="mx-auto max-w-2xl animate-scale-in">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl shadow-2xl shadow-black/50">
            {/* Tab 切换 */}
            <div className="flex border-b border-white/[0.06] bg-white/[0.02]">
              <button
                type="button"
                onClick={() => setActiveTab("url")}
                className={cn(
                  "relative flex flex-1 items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-all duration-300",
                  activeTab === "url" ? "text-indigo-300" : "text-white/30 hover:text-white/50"
                )}
              >
                <Globe className="h-4 w-4" />
                克隆网址
                {activeTab === "url" && (
                  <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 rounded-full bg-gradient-to-r from-transparent via-indigo-400 to-transparent" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("image")}
                className={cn(
                  "relative flex flex-1 items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-all duration-300",
                  activeTab === "image" ? "text-indigo-300" : "text-white/30 hover:text-white/50"
                )}
              >
                <ImageIcon className="h-4 w-4" />
                图片生成
                {activeTab === "image" && (
                  <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 rounded-full bg-gradient-to-r from-transparent via-indigo-400 to-transparent" />
                )}
              </button>
            </div>

            <div className="space-y-5 p-6 sm:p-8">
              {/* 项目名称 */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-white/80">项目名称</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="我的网站克隆"
                  disabled={status === "loading"}
                  className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-white/15 outline-none backdrop-blur-sm transition-all duration-300 focus:border-indigo-500/50 focus:bg-white/[0.07] focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
                />
              </div>

              {/* 模式输入 */}
              {activeTab === "url" ? (
                <UrlInput value={urlValue} onChange={setUrlValue} disabled={status === "loading"} />
              ) : (
                <ImageUpload onFileSelect={setImageFile} selectedFile={imageFile} disabled={status === "loading"} />
              )}

              {/* 生成按钮 */}
              <button
                type="button"
                disabled={!canGenerate || status === "loading"}
                onClick={handleGenerate}
                className={cn(
                  "relative w-full overflow-hidden rounded-xl py-3.5 text-sm font-semibold transition-all duration-300",
                  canGenerate && status !== "loading"
                    ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98]"
                    : "bg-white/5 text-white/20 cursor-not-allowed"
                )}
              >
                {canGenerate && status !== "loading" && (
                  <span className="absolute inset-0 animate-shimmer bg-[linear-gradient(110deg,transparent_30%,rgba(255,255,255,0.2)_50%,transparent_70%)] bg-[length:200%_100%]" />
                )}
                <span className="relative inline-flex items-center gap-2">
                  {status === "loading" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Wand className="h-4 w-4" />
                  )}
                  {status === "loading" ? "生成中..." : `生成 "${projectName || "项目"}"`}
                </span>
              </button>

              {/* 状态反馈 */}
              {status !== "idle" && (
                <div className={cn(
                  "rounded-xl border p-4 animate-fade-in",
                  status === "loading" && "border-indigo-500/20 bg-indigo-500/5",
                  status === "success" && "border-emerald-500/20 bg-emerald-500/5",
                  status === "error" && "border-rose-500/20 bg-rose-500/5"
                )}>
                  <div className="flex items-center gap-2.5">
                    {status === "loading" && <Loader2 className="h-4 w-4 text-indigo-400 animate-spin" />}
                    {status === "success" && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                    {status === "error" && <XCircle className="h-4 w-4 text-rose-400" />}
                    <span className={cn(
                      "text-sm",
                      status === "loading" && "text-indigo-300",
                      status === "success" && "text-emerald-300",
                      status === "error" && "text-rose-300"
                    )}>
                      {statusMessage}
                    </span>
                    {status === "success" && lastProject && (
                      <a
                        href={`/output/${lastProject.name}`}
                        className="ml-auto inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                      >
                        <ExternalLink className="h-3 w-3" />
                        查看
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ====== 项目列表 ====== */}
      <ProjectGrid projects={projects} onDelete={handleDelete} onBrowse={setBrowseProject} />

      {/* ====== 文件浏览器 ====== */}
      {browseProject && (
        <FileBrowser
          projectName={browseProject}
          onClose={() => setBrowseProject(null)}
        />
      )}
    </div>
  );
}
