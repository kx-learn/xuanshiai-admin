import type { Project } from "@/types/project";
import { ProjectCard } from "./ProjectCard";
import { FolderOpen } from "lucide-react";

interface ProjectGridProps {
  projects: Project[];
  onDelete: (id: string) => void;
  onBrowse: (projectName: string) => void;
}

export function ProjectGrid({ projects, onDelete, onBrowse }: ProjectGridProps) {
  return (
    <section className="relative mx-auto max-w-6xl px-6 pb-24">
      <div className="mb-8 flex items-center gap-3">
        <h2 className="text-xl font-bold text-white">已生成项目</h2>
        {projects.length > 0 && (
          <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-white/40">
            {projects.length}
          </span>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] py-20 backdrop-blur-sm">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
            <FolderOpen className="h-7 w-7 text-white/15" />
          </div>
          <p className="text-sm font-medium text-white/50">还没有项目</p>
          <p className="mt-1 text-xs text-white/20">在上方输入网址或上传截图，克隆你的第一个网站！</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, i) => (
            <ProjectCard
              key={project.id}
              project={project}
              onDelete={onDelete}
              onBrowse={onBrowse}
              index={i}
            />
          ))}
        </div>
      )}
    </section>
  );
}
