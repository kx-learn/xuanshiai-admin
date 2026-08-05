"use client";

import type { Project } from "@/types/project";
import { Globe, ImageIcon, Trash2, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  project: Project;
  onDelete: (id: string) => void;
  onBrowse: (projectName: string) => void;
  index: number;
}

function formatRelativeTime(isoString: string): string {
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "刚刚";
  if (diffMin < 60) return `${diffMin} 分钟前`;
  if (diffHour < 24) return `${diffHour} 小时前`;
  if (diffDay < 30) return `${diffDay} 天前`;
  if (diffDay < 365) return `${Math.floor(diffDay / 30)} 个月前`;
  return `${Math.floor(diffDay / 365)} 年前`;
}

const statusConfig: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  completed: { label: "已完成", bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-400" },
  generating: { label: "生成中", bg: "bg-indigo-500/10", text: "text-indigo-400", dot: "bg-indigo-400" },
  failed: { label: "失败", bg: "bg-rose-500/10", text: "text-rose-400", dot: "bg-rose-400" },
};

export function ProjectCard({ project, onDelete, onBrowse, index }: ProjectCardProps) {
  const status = statusConfig[project.status] ?? statusConfig.failed;
  const ModeIcon = project.mode === "url" ? Globe : ImageIcon;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm transition-all duration-500 hover:border-white/20 hover:bg-white/[0.06] hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/10",
        "animate-fade-in-up",
        `stagger-${Math.min(index + 1, 6)}`
      )}
    >
      {/* Clickable overlay for browse */}
      <button
        type="button"
        onClick={() => onBrowse(project.name)}
        className="absolute inset-0 z-10"
        aria-label={`浏览 ${project.name}`}
      />

      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
        backgroundSize: "16px 16px"
      }} />

      <div className="relative">
        <div className="mb-3 flex items-center gap-2.5">
          <div className={cn(
            "flex h-9 w-9 items-center justify-center rounded-xl transition-colors duration-300",
            project.mode === "url" ? "bg-indigo-500/15" : "bg-amber-500/15"
          )}>
            <ModeIcon className={cn(
              "h-[18px] w-[18px]",
              project.mode === "url" ? "text-indigo-400" : "text-amber-400"
            )} />
          </div>
          <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium", status.bg, status.text)}>
            <span className={cn("h-1.5 w-1.5 rounded-full", status.dot)} />
            {status.label}
          </span>
        </div>

        <h3 className="mb-1 truncate text-[15px] font-semibold text-white">{project.displayName ?? project.name}</h3>
        <p className="mb-3 truncate text-xs text-white/30">
          {project.mode === "url" ? project.sourceUrl ?? "—" : project.sourceImageName ?? "上传的图片"}
        </p>

        <div className="mb-3 flex items-center gap-3 text-xs text-white/25">
          <span>{formatRelativeTime(project.createdAt)}</span>
          {project.pageCount != null && <span>· {project.pageCount} 页</span>}
          {project.componentCount != null && <span>· {project.componentCount} 组件</span>}
        </div>

        <div className="mb-3 border-t border-white/[0.06]" />

        <div className="relative z-20 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-500/10 px-2.5 py-1 text-xs font-medium text-indigo-400 transition-colors group-hover:bg-indigo-500/20">
            <FolderOpen className="h-3.5 w-3.5" />
            查看代码
          </span>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete(project.id); }}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-white/25 transition-colors hover:bg-rose-500/10 hover:text-rose-400"
          >
            <Trash2 className="h-3.5 w-3.5" />
            删除
          </button>
        </div>
      </div>
    </div>
  );
}
