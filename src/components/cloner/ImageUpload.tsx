"use client";

import { useState, useRef, useCallback, type DragEvent } from "react";
import { Upload, ImageIcon, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  disabled?: boolean;
}

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024;

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ImageUpload({
  onFileSelect,
  selectedFile,
  disabled,
}: ImageUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return "不支持的文件类型，请使用 PNG、JPG 或 WEBP 格式";
    }
    if (file.size > MAX_SIZE) {
      return `文件过大（${formatSize(file.size)}），最大支持 ${formatSize(MAX_SIZE)}`;
    }
    return null;
  }, []);

  const handleFile = useCallback(
    (file: File) => {
      setError(null);
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        onFileSelect(null);
        return;
      }
      onFileSelect(file);
    },
    [validateFile, onFileSelect]
  );

  const handleDragEnter = useCallback(
    (e: DragEvent) => { e.preventDefault(); e.stopPropagation(); if (!disabled) setIsDragOver(true); },
    [disabled]
  );
  const handleDragLeave = useCallback((e: DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); }, []);
  const handleDragOver = useCallback(
    (e: DragEvent) => { e.preventDefault(); e.stopPropagation(); if (!disabled) setIsDragOver(true); },
    [disabled]
  );
  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault(); e.stopPropagation(); setIsDragOver(false);
      if (disabled) return;
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [disabled, handleFile]
  );

  const handleClick = useCallback(() => { if (!disabled) inputRef.current?.click(); }, [disabled]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      e.target.value = "";
    },
    [handleFile]
  );

  const handleRemove = useCallback((e: React.MouseEvent) => { e.stopPropagation(); onFileSelect(null); setError(null); }, [onFileSelect]);

  const previewUrl = selectedFile ? URL.createObjectURL(selectedFile) : null;

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-white/80">上传截图或设计稿</label>
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleInputChange} className="hidden" />
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={handleClick}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleClick(); } }}
        onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDrop={handleDrop}
        className={cn(
          "relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 transition-all duration-500",
          isDragOver && !disabled
            ? "scale-[1.02] border-indigo-400 bg-indigo-500/10 shadow-lg shadow-indigo-500/20"
            : selectedFile
              ? "border-emerald-500/30 bg-emerald-500/5"
              : "border-white/10 bg-white/[0.02] hover:border-indigo-500/30 hover:bg-white/[0.04]",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        {selectedFile && previewUrl ? (
          <div className="flex w-full flex-col items-center gap-3 animate-scale-in">
            <div className="relative">
              <img src={previewUrl} alt={selectedFile.name} className="max-h-48 rounded-xl object-contain shadow-2xl" />
              <button
                type="button" onClick={handleRemove}
                className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-white shadow-lg transition-transform hover:scale-110"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-white/80">{selectedFile.name}</p>
              <p className="text-xs text-white/40">{formatSize(selectedFile.size)}</p>
            </div>
          </div>
        ) : (
          <>
            <div className={cn(
              "relative mb-3 flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-500",
              isDragOver ? "scale-110 bg-indigo-500/20 shadow-lg shadow-indigo-500/20" : "bg-white/5"
            )}>
              {isDragOver ? (
                <Sparkles className="h-7 w-7 text-indigo-400" />
              ) : (
                <ImageIcon className="h-7 w-7 text-white/20" />
              )}
            </div>
            <p className="text-sm font-medium text-white/60">
              {isDragOver ? "松开鼠标上传图片" : "拖拽图片到此处，或点击选择文件"}
            </p>
            <p className="mt-1 text-xs text-white/25">支持 PNG、JPG、WEBP 格式，最大 10MB</p>
          </>
        )}
      </div>
      {error && <p className="text-xs text-rose-400">{error}</p>}
    </div>
  );
}
