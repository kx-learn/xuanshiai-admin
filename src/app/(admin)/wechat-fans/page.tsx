"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Inbox, RefreshCw, Users } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { asObject, asStr, showConfigToast, useConfigDomain, type Dict } from "@/lib/platform-config";

interface FanRow {
  id: number;
  nickname: string;
  openid: string;
  followed: boolean;
  followTime: string;
  group: string;
}

const DEFAULTS = { items: [] as unknown[] } as const;

export default function WechatFansPage() {
  const domain = useConfigDomain<Dict>("wechat_mp_fans", DEFAULTS as Dict);
  const [fans, setFans] = useState<FanRow[]>([]);
  const [group, setGroup] = useState("");
  const [searchType, setSearchType] = useState("");
  const [keyword, setKeyword] = useState("");
  const [selected, setSelected] = useState<number[]>([]);

  const apply = useCallback((config: Dict | null) => {
    const list = Array.isArray(config?.items) ? config!.items : [];
    setFans(list.map((r, i) => {
      const o = asObject(r as Dict);
      return {
        id: Number(o.id ?? i + 1),
        nickname: asStr(o.nickname, ""),
        openid: asStr(o.openid, ""),
        followed: o.followed === true,
        followTime: asStr(o.follow_time, ""),
        group: asStr(o.group, ""),
      };
    }));
  }, []);

  useEffect(() => { domain.reload(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);
  useEffect(() => { apply(domain.snapshot?.config ?? null); }, [domain.snapshot, apply]);

  const shown = useMemo(() => fans.filter((f) => {
    if (group && f.group !== group) return false;
    if (!keyword) return true;
    if (searchType === "openid") return f.openid.toLowerCase().includes(keyword.toLowerCase());
    if (searchType === "follow") return f.followTime.includes(keyword);
    return f.nickname.includes(keyword);
  }), [fans, group, keyword, searchType]);

  const allChecked = shown.length > 0 && selected.length === shown.length;

  return (
    <div className="wechat-fans-page">
      <AdminBreadcrumb
        items={[
          { label: "首页", href: "/" },
          { label: "公众号", href: "/wechat-fans", children: [{ label: "关注粉丝", href: "/wechat-fans" }] },
          { label: "关注粉丝" },
        ]}
      />

      {/* 须知 */}
      <div className="fan-notice">
        <div className="fan-notice-title">
          <span className="fan-notice-icon">i</span>须知
        </div>
        <p>这里的粉丝是指关注了您的公众号的粉丝，昵称是指该粉丝在您的系统平台中注册的账号昵称。</p>
      </div>

      {/* 用户管理 */}
      <div className="admin-card">
        <div className="admin-card-header">用户管理</div>
        <div className="admin-card-body px-6 pb-6">
          {/* 筛选工具栏 */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                className="h-10 w-[150px] rounded border border-[#d9d9d9] bg-white px-3 text-sm text-[#6b7688] outline-none"
              >
                <option value="">请选择分组</option>
                <option value="1">分组A</option>
                <option value="2">分组B</option>
              </select>

              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="h-10 w-[130px] rounded border border-[#d9d9d9] bg-white px-3 text-sm text-[#6b7688] outline-none"
              >
                <option value="">按昵称搜</option>
                <option value="openid">按openId搜</option>
                <option value="follow">按关注时间搜</option>
              </select>

              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="请输入"
                className="h-10 w-[240px] rounded border border-[#d9d9d9] px-3 text-sm outline-none placeholder:text-[#b4bac5] focus:border-[#3658f7]"
              />

              <button type="button" className="h-10 rounded bg-[#3658f7] px-5 text-sm text-white">
                搜索
              </button>

              <span className="text-sm text-[#6b7688]">找到粉丝：{shown.length}人</span>
            </div>

            <div className="flex items-center gap-3">
              <button type="button" className="flex h-10 items-center gap-1.5 rounded bg-[#3658f7] px-4 text-sm text-white" onClick={() => showConfigToast("粉丝分组需接入公众号平台后可用", "error")}>
                <Users size={15} />
                管理粉丝分组
              </button>
              <button type="button" className="flex h-10 items-center gap-1.5 rounded bg-[#3658f7] px-4 text-sm text-white" onClick={() => showConfigToast("同步粉丝需接入公众号平台后可用", "error")}>
                <RefreshCw size={15} />
                同步公众号粉丝
              </button>
            </div>
          </div>

          {/* 表格 */}
          <div className="mt-4 overflow-auto rounded-[6px] border border-[#f0f0f0]">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#fafafa]">
                  <th className="w-12 border-b border-[#f0f0f0] px-3 py-3">
                    <input
                      type="checkbox"
                      aria-label="全选"
                      checked={allChecked}
                      onChange={(e) =>
                        setSelected(e.target.checked ? shown.map((f) => f.id) : [])
                      }
                    />
                  </th>
                  <th className="border-b border-[#f0f0f0] px-3 py-3 text-left text-sm font-medium text-[#333]">ID</th>
                  <th className="border-b border-[#f0f0f0] px-3 py-3 text-left text-sm font-medium text-[#333]">昵称</th>
                  <th className="border-b border-[#f0f0f0] px-3 py-3 text-left text-sm font-medium text-[#333]">openId</th>
                  <th className="border-b border-[#f0f0f0] px-3 py-3 text-left text-sm font-medium text-[#333]">是否关注</th>
                  <th className="border-b border-[#f0f0f0] px-3 py-3 text-left text-sm font-medium text-[#333]">关注时间</th>
                  <th className="border-b border-[#f0f0f0] px-3 py-3 text-left text-sm font-medium text-[#333]">分组</th>
                </tr>
              </thead>
              <tbody>
                {shown.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-0">
                      <div className="flex flex-col items-center justify-center py-16 text-sm text-[#999]">
                        <Inbox className="mb-2 h-10 w-10 text-[#d8dde6]" strokeWidth={1.2} />
                        {domain.loading ? "加载中…" : "暂无数据（接入公众号平台后可同步粉丝）"}
                      </div>
                    </td>
                  </tr>
                ) : (
                  shown.map((f) => (
                    <tr key={f.id} className="border-b border-[#f0f0f0] transition-colors hover:bg-[#fafafa]">
                      <td className="px-3 py-3">
                        <input
                          type="checkbox"
                          checked={selected.includes(f.id)}
                          onChange={(e) =>
                            setSelected((cur) =>
                              e.target.checked ? [...cur, f.id] : cur.filter((id) => id !== f.id),
                            )
                          }
                        />
                      </td>
                      <td className="px-3 py-3 text-sm text-[#333]">{f.id}</td>
                      <td className="px-3 py-3 text-sm text-[#333]">{f.nickname}</td>
                      <td className="px-3 py-3 text-sm text-[#333]">{f.openid}</td>
                      <td className="px-3 py-3 text-sm text-[#333]">{f.followed ? "是" : "否"}</td>
                      <td className="px-3 py-3 text-sm text-[#333]">{f.followTime}</td>
                      <td className="px-3 py-3 text-sm text-[#333]">{f.group || "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
