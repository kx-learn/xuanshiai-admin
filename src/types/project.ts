export type ProjectMode = "url" | "image";

export type ProjectStatus = "generating" | "completed" | "failed";

export interface Project {
  id: string;
  name: string;
  displayName?: string;
  mode: ProjectMode;
  sourceUrl?: string;
  sourceImageName?: string;
  createdAt: string;
  completedAt?: string;
  status: ProjectStatus;
  outputPath: string;
  pageCount?: number;
  componentCount?: number;
  errorMessage?: string;
}
