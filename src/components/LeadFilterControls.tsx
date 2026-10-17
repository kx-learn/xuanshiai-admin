"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { adminApi } from "@/lib/admin-api";

/**
 * 线索/客源筛选用的原站同款控件：
 * - FilterSelect        单选下拉（面板首项「xx：不限」= 重置）
 * - FilterMultiSelect   多选下拉（标签等）
 * - RangeSliderFilter   双滑杆区间（年龄/身高），带「确 定」按钮
 * - RegionCascaderFilter 省市级联（家乡/现居），数据来自 regions/provinces|cities
 */

export type LeadFilterOption = { value: string; label: string };

const toOptions = (options: (string | LeadFilterOption)[]): LeadFilterOption[] =>
  options.map((option) => (typeof option === "string" ? { value: option, label: option } : option));

function useOutsideClose(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) close();
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open, close]);
  return ref;
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg className={`ldd-chevron${open ? " open" : ""}`} viewBox="0 0 1024 1024" width="12" height="12" aria-hidden="true">
      <path
        d="M884 256h-75c-5.1 0-9.9 2.5-12.9 6.6L512 654.2 227.9 262.6c-3-4.1-7.8-6.6-12.9-6.6h-75c-6.5 0-10.3 7.4-6.5 12.7l352.6 486.1c12.8 17.6 39 17.6 51.8 0l352.6-486.1c3.9-5.3.1-12.7-6.5-12.7z"
        fill="currentColor"
      />
    </svg>
  );
}

/* ───────────────────────── 单选下拉 ───────────────────────── */

export function FilterSelect({
  label,
  options = [],
  value,
  onChange,
  className,
}: {
  label: string;
  options?: (string | LeadFilterOption)[];
  /** 不传 value/onChange 时为纯展示的「非受控」模式 */
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}) {
  const normalized = useMemo(() => toOptions(options), [options]);
  const [open, setOpen] = useState(false);
  const [inner, setInner] = useState("");
  const controlled = onChange !== undefined;
  const current = controlled ? value ?? "" : inner;
  const ref = useOutsideClose(open, () => setOpen(false));
  const select = (next: string) => {
    if (!controlled) setInner(next);
    onChange?.(next);
    setOpen(false);
  };
  return (
    <div className={`relative ${className ?? ""}`.trim()} ref={ref}>
      <button type="button" className={`ldd-trigger${current ? " active" : ""}`} onClick={() => setOpen((o) => !o)}>
        <span className="truncate">{label}：{current || "不限"}</span>
        <Chevron open={open} />
      </button>
      {open && (
        <div className="ldd-panel">
          <button type="button" className={`ldd-item${current === "" ? " selected" : ""}`} onClick={() => select("")}>
            {label}：不限
          </button>
          {normalized.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`ldd-item${current === option.value ? " selected" : ""}`}
              onClick={() => select(option.value === current ? "" : option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── 多选下拉 ───────────────────────── */

export function FilterMultiSelect({
  label,
  options = [],
  value,
  onChange,
  className,
}: {
  label: string;
  options?: (string | LeadFilterOption)[];
  value: string[];
  onChange: (value: string[]) => void;
  className?: string;
}) {
  const normalized = useMemo(() => toOptions(options), [options]);
  const [open, setOpen] = useState(false);
  const ref = useOutsideClose(open, () => setOpen(false));
  const toggle = (v: string) =>
    onChange(value.includes(v) ? value.filter((item) => item !== v) : [...value, v]);
  return (
    <div className={`relative ${className ?? ""}`.trim()} ref={ref}>
      <button type="button" className={`ldd-trigger${value.length ? " active" : ""}`} onClick={() => setOpen((o) => !o)}>
        <span className="truncate">
          {label}：{value.length ? value.join("、") : "不限（多选）"}
        </span>
        <Chevron open={open} />
      </button>
      {open && (
        <div className="ldd-panel">
          {normalized.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`ldd-item${value.includes(option.value) ? " selected" : ""}`}
              onClick={() => toggle(option.value)}
            >
              <span className="flex-1 truncate text-left">{option.label}</span>
              {value.includes(option.value) && <span className="ldd-tick" aria-hidden="true" />}
            </button>
          ))}
          {normalized.length === 0 && <div className="ldd-region-empty">暂无可选项</div>}
        </div>
      )}
    </div>
  );
}

/* ───────────────────── 双滑杆区间（年龄/身高） ───────────────────── */

export function RangeSliderFilter({
  label,
  min,
  max,
  unit,
  value,
  onChange,
  className,
}: {
  label: string;
  min: number;
  max: number;
  unit: string;
  value: [number, number] | null;
  onChange: (value: [number, number] | null) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useOutsideClose(open, () => setOpen(false));
  const [lo, setLo] = useState(value?.[0] ?? min);
  const [hi, setHi] = useState(value?.[1] ?? max);
  useEffect(() => {
    if (open) {
      setLo(value?.[0] ?? min);
      setHi(value?.[1] ?? max);
    }
    // 仅在打开面板时同步外部值
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  const nowYear = new Date().getFullYear();
  const isAge = unit === "岁";
  const isFull = lo <= min && hi >= max;
  const pct = (v: number) => ((v - min) / (max - min)) * 100;
  const commit = () => {
    onChange(isFull ? null : [lo, hi]);
    setOpen(false);
  };
  return (
    <div className={`relative ${className ?? ""}`.trim()} ref={ref}>
      <button type="button" className={`ldd-trigger${value ? " active" : ""}`} onClick={() => setOpen((o) => !o)}>
        <span className="truncate">{label}：{value ? `${value[0]}-${value[1]}${unit}` : "不限"}</span>
        <Chevron open={open} />
      </button>
      {open && (
        <div className="ldd-panel ldd-range-panel">
          {isAge && (
            <div className="ldd-range-text">
              {lo}岁({nowYear - lo}年) - {hi}岁({nowYear - hi}年)
            </div>
          )}
          <div className="ldual">
            <div className="ldual-rail" />
            <div className="ldual-fill" style={{ left: `${pct(lo)}%`, width: `${pct(hi) - pct(lo)}%` }} />
            <input
              type="range"
              min={min}
              max={max}
              value={hi}
              aria-label={`${label}最大值`}
              onChange={(event) => setHi(Math.max(Number(event.target.value), lo))}
            />
            <input
              type="range"
              min={min}
              max={max}
              value={lo}
              aria-label={`${label}最小值`}
              onChange={(event) => setLo(Math.min(Number(event.target.value), hi))}
            />
          </div>
          {isAge ? (
            <div className="ldd-range-row ldd-range-center">
              <button type="button" className="ldd-range-ok" onClick={commit}>
                确 定
              </button>
            </div>
          ) : (
            <div className="ldd-range-row">
              <span className="ldd-range-label">拖动按钮选择{label}：</span>
              <input
                type="number"
                className="ldd-range-num"
                min={min}
                max={max}
                value={lo}
                onChange={(event) => setLo(Math.min(Math.max(Number(event.target.value) || min, min), hi))}
              />
              <span>-</span>
              <input
                type="number"
                className="ldd-range-num"
                min={min}
                max={max}
                value={hi}
                onChange={(event) => setHi(Math.max(Math.min(Number(event.target.value) || max, max), lo))}
              />
              <span>{unit}</span>
              <button type="button" className="ldd-range-ok" onClick={commit}>
                确 定
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ───────────────────── 省市级联（家乡/现居） ───────────────────── */

type Region = { code: string; name: string };

export function RegionCascaderFilter({
  label,
  value,
  onChange,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useOutsideClose(open, () => setOpen(false));
  const [provinces, setProvinces] = useState<Region[]>([]);
  const [activeProvince, setActiveProvince] = useState<Region | null>(null);
  const [cities, setCities] = useState<Region[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (open && provinces.length === 0) {
      adminApi<{ items: Region[] }>("regions/provinces")
        .then((data) => setProvinces(data.items ?? []))
        .catch(() => setProvinces([]));
    }
  }, [open, provinces.length]);
  const pickProvince = (province: Region) => {
    setActiveProvince(province);
    setLoading(true);
    adminApi<{ items: Region[] }>("regions/cities", {
      query: { province_code: (province.code ?? "").replace(/\D/g, "").slice(0, 2) },
    })
      .then((data) => setCities(data.items ?? []))
      .catch(() => setCities([]))
      .finally(() => setLoading(false));
  };
  return (
    <div className={`relative ${className ?? ""}`.trim()} ref={ref}>
      <button type="button" className={`ldd-trigger${value ? " active" : ""}`} onClick={() => setOpen((o) => !o)}>
        <span className="truncate">{label}：{value || "不限"}</span>
        <Chevron open={open} />
      </button>
      {open && (
        <div className="ldd-panel ldd-region-panel">
          <div className="ldd-region-col">
            {provinces.map((province) => (
              <button
                key={province.code}
                type="button"
                className={`ldd-item${activeProvince?.code === province.code ? " selected" : ""}`}
                onClick={() => pickProvince(province)}
              >
                <span className="flex-1 truncate text-left">{province.name}</span>
                <span className="ldd-sub-arrow" aria-hidden="true" />
              </button>
            ))}
            {provinces.length === 0 && <div className="ldd-region-empty">加载中…</div>}
          </div>
          {activeProvince && (
            <div className="ldd-region-col ldd-region-cities">
              {loading ? (
                <div className="ldd-region-empty">加载中…</div>
              ) : cities.length === 0 ? (
                <div className="ldd-region-empty">暂无城市</div>
              ) : (
                cities.map((city) => (
                  <button
                    key={city.code}
                    type="button"
                    className={`ldd-item${value === `${activeProvince.name} ${city.name}` ? " selected" : ""}`}
                    onClick={() => {
                      onChange(`${activeProvince.name} ${city.name}`);
                      setOpen(false);
                    }}
                  >
                    {city.name}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
