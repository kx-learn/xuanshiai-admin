import { type Project } from "@/types/project";

const REGISTRY_PATH = "output/projects.json";

let cachedRegistry: Project[] | null = null;

function invalidateCache(): void {
  cachedRegistry = null;
}

async function readRegistry(): Promise<Project[]> {
  if (cachedRegistry) return cachedRegistry;

  try {
    // In Next.js, we can use dynamic import with webpack fs for server-side
    // For client-side, we fetch via a public JSON endpoint
    if (typeof window === "undefined") {
      const { readFileSync, existsSync } = await import("node:fs");
      const { join } = await import("node:path");
      const filePath = join(process.cwd(), REGISTRY_PATH);
      if (!existsSync(filePath)) {
        cachedRegistry = [];
        return [];
      }
      const raw = readFileSync(filePath, "utf-8");
      cachedRegistry = JSON.parse(raw) as Project[];
      return cachedRegistry;
    }
    // Client-side: fetch the JSON file
    const res = await fetch(`/${REGISTRY_PATH}`);
    if (!res.ok) {
      cachedRegistry = [];
      return [];
    }
    cachedRegistry = (await res.json()) as Project[];
    return cachedRegistry;
  } catch {
    cachedRegistry = [];
    return [];
  }
}

async function writeRegistry(projects: Project[]): Promise<void> {
  if (typeof window === "undefined") {
    const { writeFileSync, mkdirSync, existsSync } = await import("node:fs");
    const { join } = await import("node:path");
    const dirPath = join(process.cwd(), "output");
    if (!existsSync(dirPath)) {
      mkdirSync(dirPath, { recursive: true });
    }
    const filePath = join(dirPath, "projects.json");
    writeFileSync(filePath, JSON.stringify(projects, null, 2), "utf-8");
  }
  cachedRegistry = projects;
}

export async function getProjects(): Promise<Project[]> {
  const projects = await readRegistry();
  return projects.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getProject(id: string): Promise<Project | undefined> {
  const projects = await readRegistry();
  return projects.find((p) => p.id === id);
}

export async function addProject(project: Project): Promise<void> {
  const projects = await readRegistry();
  projects.push(project);
  await writeRegistry(projects);
}

export async function updateProject(
  id: string,
  updates: Partial<Project>
): Promise<void> {
  const projects = await readRegistry();
  const index = projects.findIndex((p) => p.id === id);
  if (index !== -1) {
    projects[index] = { ...projects[index], ...updates };
    await writeRegistry(projects);
  }
}

export async function deleteProject(id: string): Promise<void> {
  const projects = await readRegistry();
  const filtered = projects.filter((p) => p.id !== id);
  await writeRegistry(filtered);
}

export function generateProjectId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 8);
  return `${timestamp}-${random}`;
}
