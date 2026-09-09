"use client";

import PageSizeSelect from "@/components/PageSizeSelect";

function getPages(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "...", total];
  if (current >= total - 3) return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "...", current - 1, current, current + 1, "...", total];
}

export default function AdminPagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}) {
  if (total <= 0) return null;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pages = getPages(page, totalPages);
  const showEdges = totalPages > 1;

  const go = (target: number) => {
    const next = Math.min(totalPages, Math.max(1, target));
    if (next === page) return;
    const scrollY = window.scrollY;
    onPageChange(next);
    requestAnimationFrame(() => window.scrollTo(0, scrollY));
    setTimeout(() => window.scrollTo(0, scrollY), 60);
  };

  return (
    <div className="admin-pagination">
      {showEdges && (
        <button
          type="button"
          aria-label="上一页"
          disabled={page <= 1}
          onClick={() => go(page - 1)}
        >
          <svg className="pg-icon" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path d="M7.5 2 L4.5 6 L7.5 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
      {pages.map((p, i) => {
        if (p === "...") {
          const isHead = i === 0;
          return (
            <button
              key={`ellipsis-${i}`}
              type="button"
              className={`ellipsis ${isHead ? "ellipsis-head" : "ellipsis-tail"}`}
              aria-label={isHead ? "往前跳5页" : "往后跳5页"}
              title={isHead ? "往前5页" : "往后5页"}
              onClick={() => go(page + (isHead ? -5 : 5))}
            >
              <span className="dots">…</span>
              <span className="jump-arrow" aria-hidden>
                <i className={isHead ? "left" : "right"} />
                <i className={isHead ? "left" : "right"} />
              </span>
            </button>
          );
        }
        return (
          <button
            key={p}
            type="button"
            className={p === page ? "active" : "page-link"}
            onClick={() => go(p)}
          >
            {p}
          </button>
        );
      })}
      {showEdges && (
        <button
          type="button"
          aria-label="下一页"
          disabled={page >= totalPages}
          onClick={() => go(page + 1)}
        >
          <svg className="pg-icon" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path d="M4.5 2 L7.5 6 L4.5 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
      <PageSizeSelect value={pageSize} total={total} onChange={onPageSizeChange} />
    </div>
  );
}
