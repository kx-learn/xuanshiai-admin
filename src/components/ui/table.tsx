"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export interface Column {
  key: string;
  title: string;
  dataIndex: string;
  width?: number | string;
  render?: (value: unknown, record: Record<string, unknown>, index: number) => ReactNode;
}

export interface DataTableProps {
  columns: Column[];
  dataSource: Record<string, unknown>[];
  rowKey?: string;
  loading?: boolean;
  className?: string;
}

export function DataTable({
  columns,
  dataSource,
  rowKey = "id",
  loading = false,
  className,
}: DataTableProps) {
  if (loading) {
    return (
      <div className={cn("w-full overflow-auto rounded-[6px] border border-[#f0f0f0]", className)}>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="bg-[#fafafa] px-2 py-2 text-left text-sm font-medium text-[#333] border-b border-[#f0f0f0]"
                  style={col.width ? { width: col.width } : undefined}
                >
                  {col.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, rowIdx) => (
              <tr key={rowIdx}>
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="px-2 py-2 text-sm text-[#333] border-b border-[#f0f0f0]"
                  >
                    <div className="h-4 w-full animate-pulse rounded bg-[#f0f0f0]" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (dataSource.length === 0) {
    return (
      <div className={cn("w-full overflow-auto rounded-[6px] border border-[#f0f0f0]", className)}>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="bg-[#fafafa] px-2 py-2 text-left text-sm font-medium text-[#333] border-b border-[#f0f0f0]"
                  style={col.width ? { width: col.width } : undefined}
                >
                  {col.title}
                </th>
              ))}
            </tr>
          </thead>
        </table>
        <div className="flex items-center justify-center py-16 text-sm text-[#999]">
          No data
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full overflow-auto rounded-[6px] border border-[#f0f0f0]", className)}>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="bg-[#fafafa] px-2 py-2 text-left text-sm font-medium text-[#333] border-b border-[#f0f0f0]"
                style={col.width ? { width: col.width } : undefined}
              >
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dataSource.map((record, rowIdx) => (
            <tr
              key={String(record[rowKey] ?? rowIdx)}
              className="transition-colors hover:bg-[#fafafa]"
            >
              {columns.map((col) => {
                const value = record[col.dataIndex];
                return (
                  <td
                    key={col.key}
                    className="px-2 py-2 text-sm text-[#333] border-b border-[#f0f0f0]"
                  >
                    {col.render
                      ? col.render(value, record, rowIdx)
                      : (value as ReactNode) ?? null}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
