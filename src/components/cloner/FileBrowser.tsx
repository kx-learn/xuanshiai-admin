"use client";

import { useState, useEffect, useCallback } from "react";
import {
  X, Folder, FolderOpen, File, ChevronRight, ChevronDown,
  Loader2, FileCode, ExternalLink, FolderOpenDot
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FileNode {
  name: string;
  path: string;
  type: "file" | "directory";
  size?: number;
  children?: FileNode[];
}

interface FileData {
  name: string;
  path: string;
  content: string;
  size: number;
  language: string;
}

interface ProjectInfo {
  name: string;
  tree: FileNode[];
  totalFiles: number;
}

interface FileBrowserProps {
  projectName: string;
  onClose: () => void;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(name: string): React.ReactNode {
  const ext = name.split(".").pop()?.toLowerCase();
  const iconMap: Record<string, string> = {
    tsx: "text-blue-400", ts: "text-blue-400", jsx: "text-yellow-400",
    js: "text-yellow-400", css: "text-purple-400", json: "text-green-400",
    md: "text-white/50", html: "text-orange-400", svg: "text-pink-400",
    ico: "text-white/30", png: "text-white/30", jpg: "text-white/30",
  };
  const color = iconMap[ext ?? ""] ?? "text-white/30";
  return <FileCode className={cn("h-3.5 w-3.5", color)} />;
}

function TreeNode({
  node,
  depth,
  selectedPath,
  onSelect,
  defaultExpanded,
}: {
  node: FileNode;
  depth: number;
  selectedPath: string | null;
  onSelect: (path: string) => void;
  defaultExpanded: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  if (node.type === "directory") {
    const hasChildren = node.children && node.children.length > 0;
    return (
      <div>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center gap-1.5 rounded-lg px-2 py-1 text-left text-white/60 transition-colors hover:bg-white/5 hover:text-white/80"
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
        >
          {hasChildren ? (
            expanded ? <ChevronDown className="h-3.5 w-3.5 shrink-0" /> : <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          ) : (
            <span className="w-3.5 shrink-0" />
          )}
          {expanded ? (
            <FolderOpen className="h-3.5 w-3.5 shrink-0 text-indigo-400/60" />
          ) : (
            <Folder className="h-3.5 w-3.5 shrink-0 text-indigo-400/40" />
          )}
          <span className="truncate text-[13px]">{node.name}</span>
        </button>
        {expanded && hasChildren && (
          <div>
            {node.children!.map((child) => (
              <TreeNode
                key={child.path}
                node={child}
                depth={depth + 1}
                selectedPath={selectedPath}
                onSelect={onSelect}
                defaultExpanded={depth < 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(node.path)}
      className={cn(
        "flex w-full items-center gap-1.5 rounded-lg px-2 py-1 text-left transition-colors",
        selectedPath === node.path
          ? "bg-indigo-500/15 text-indigo-300"
          : "text-white/50 hover:bg-white/5 hover:text-white/70"
      )}
      style={{ paddingLeft: `${depth * 16 + 28}px` }}
    >
      {getFileIcon(node.name)}
      <span className="truncate text-[13px]">{node.name}</span>
      {node.size != null && (
        <span className="ml-auto shrink-0 text-[10px] text-white/20">
          {formatSize(node.size)}
        </span>
      )}
    </button>
  );
}

export function FileBrowser({ projectName, onClose }: FileBrowserProps) {
  const [tree, setTree] = useState<FileNode[]>([]);
  const [totalFiles, setTotalFiles] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [fileLoading, setFileLoading] = useState(false);

  // Load project tree
  useEffect(() => {
    setLoading(true);
    fetch(`/api/files?project=${encodeURIComponent(projectName)}`)
      .then((r) => r.json())
      .then((data: ProjectInfo) => {
        setTree(data.tree ?? []);
        setTotalFiles(data.totalFiles ?? 0);
      })
      .catch(() => setTree([]))
      .finally(() => setLoading(false));
  }, [projectName]);

  // Load file content
  const openFile = useCallback(
    (path: string) => {
      setSelectedFile(path);
      setFileLoading(true);
      setFileData(null);
      fetch(`/api/files?project=${encodeURIComponent(projectName)}&file=${encodeURIComponent(path)}`)
        .then((r) => r.json())
        .then((data: FileData) => setFileData(data))
        .catch(() => setFileData(null))
        .finally(() => setFileLoading(false));
    },
    [projectName]
  );

  // Keyboard escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fade-in">
      <div className="flex h-[85vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#08080c] shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.02] px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/15">
              <FolderOpenDot className="h-4 w-4 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">{projectName}</h3>
              <p className="text-[11px] text-white/30">
                {totalFiles} 个文件
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-white/30 transition-colors hover:bg-white/5 hover:text-white/60"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body: tree + viewer */}
        <div className="flex flex-1 overflow-hidden">
          {/* File tree sidebar */}
          <div className="w-72 shrink-0 overflow-y-auto border-r border-white/[0.04] bg-white/[0.01] p-3">
            {loading ? (
              <div className="flex items-center gap-2 px-2 py-6 text-white/30 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                加载文件列表...
              </div>
            ) : tree.length === 0 ? (
              <div className="px-2 py-6 text-white/20 text-sm">暂无文件</div>
            ) : (
              tree.map((node) => (
                <TreeNode
                  key={node.path}
                  node={node}
                  depth={0}
                  selectedPath={selectedFile}
                  onSelect={openFile}
                  defaultExpanded
                />
              ))
            )}
          </div>

          {/* Code viewer */}
          <div className="flex-1 overflow-hidden flex flex-col bg-[#050508]">
            {!selectedFile ? (
              <div className="flex flex-1 items-center justify-center">
                <div className="text-center">
                  <FileCode className="mx-auto h-10 w-10 text-white/10 mb-3" />
                  <p className="text-sm text-white/20">选择左侧文件查看内容</p>
                </div>
              </div>
            ) : fileLoading ? (
              <div className="flex flex-1 items-center justify-center gap-2 text-white/30 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                加载中...
              </div>
            ) : fileData ? (
              <>
                {/* File header */}
                <div className="flex items-center justify-between border-b border-white/[0.04] px-5 py-2.5">
                  <div className="flex items-center gap-2">
                    {getFileIcon(fileData.name)}
                    <span className="text-sm text-white/80 font-mono">{fileData.name}</span>
                    <span className="text-[11px] text-white/20">{formatSize(fileData.size)}</span>
                  </div>
                  <span className="text-[10px] text-white/20 uppercase">{fileData.language}</span>
                </div>
                {/* Code content */}
                <div className="flex-1 overflow-auto">
                  <pre className="p-5 text-[13px] leading-relaxed font-mono text-white/80 whitespace-pre-wrap">
                    <code>{fileData.content}</code>
                  </pre>
                </div>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center text-sm text-white/20">
                无法加载文件
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
