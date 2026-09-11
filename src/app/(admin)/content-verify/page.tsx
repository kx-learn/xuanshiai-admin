"use client";

import { useEffect, useRef, useState } from "react";
import {
  Camera,
  ChevronDown,
  Image as ImageIcon,
  Play,
  RefreshCw,
  Search,
  Video,
  X,
} from "lucide-react";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { adminEndpoints } from "@/lib/admin-endpoints";
import type {
  MemberIntroItem,
  MemberIntroQuery,
  MemberMediaItem,
  MemberMediaQuery,
  MemberMediaType,
} from "@/lib/admin-endpoints";
import { showConfigToast, pickAndUploadImage } from "@/lib/platform-config";
import { resolveMediaUrl } from "@/lib/admin-api";
import MemberQuickProfileDrawer from "@/components/MemberQuickProfileDrawer";

type Tab = "intro" | "avatar" | "photo" | "video";

const tabs: { key: Tab; label: string }[] = [
  { key: "intro", label: "个人介绍" },
  { key: "avatar", label: "头像" },
  { key: "photo", label: "照片" },
  { key: "video", label: "视频" },
];

/* 时间格式化：ISO -> YYYY-MM-DD HH:mm:ss（与 UI 原占位一致） */
const fmtDateTime = (v: string | null | undefined): string => {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
};

export default function ContentVerifyPage() {
  const [tab, setTab] = useState<Tab>("intro");
  const label = tabs.find((item) => item.key === tab)?.label ?? "个人介绍";

  // ─── 个人介绍筛选/数据 ─────────────────────────────────────
  const [introLetterMode, setIntroLetterMode] = useState(""); // ""不限 / "1"含有 / "2"不含
  const [introLetterLower, setIntroLetterLower] = useState("1"); // "1"含小写 / "0"不限
  const [introDigit, setIntroDigit] = useState("1"); // "1"含数字 / "0"不限
  const [introCnDigit, setIntroCnDigit] = useState("1"); // "1"含中文数字 / "0"不限
  const [introKeyword, setIntroKeyword] = useState("");
  const [introRows, setIntroRows] = useState<MemberIntroItem[]>([]);
  const [introLoading, setIntroLoading] = useState(false);
  const [introEdits, setIntroEdits] = useState<Record<number, string>>({});

  // ─── 头像筛选/数据 ─────────────────────────────────────────
  const [avatarStatus1, setAvatarStatus1] = useState(""); // ""不限 / "1"待审核=0 / "2"已通过=1
  const [avatarStatus2, setAvatarStatus2] = useState(""); // ""未通过=2 / "1"已通过=1
  const [avatarGender, setAvatarGender] = useState(""); // ""不限 / "1"男 / "2"女
  const [avatarKeyword, setAvatarKeyword] = useState("");
  const [avatarRows, setAvatarRows] = useState<MemberMediaItem[]>([]);
  const [avatarLoading, setAvatarLoading] = useState(false);

  // ─── 照片/视频筛选/数据 ────────────────────────────────────
  const [mediaKeyword, setMediaKeyword] = useState("");
  const [mediaRows, setMediaRows] = useState<MemberMediaItem[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);

  // ─── 查看资料抽屉 ──────────────────────────────────────────
  const [profile, setProfile] = useState<{ memberId: number; nickname?: string | null; memberCode?: string | null } | null>(null);

  // ─── 历史头像弹窗 ──────────────────────────────────────────
  const [history, setHistory] = useState<{ open: boolean; userId: number; items: MemberMediaItem[]; loading: boolean }>({
    open: false,
    userId: 0,
    items: [],
    loading: false,
  });

  // 重新上传所需隐藏文件输入
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const [pendingReplaceId, setPendingReplaceId] = useState<number | null>(null);

  // ─── 数据加载 ──────────────────────────────────────────────
  const loadIntro = async () => {
    setIntroLoading(true);
    try {
      const q: MemberIntroQuery = { page: 1, page_size: 20 };
      if (introKeyword.trim()) q.keyword = introKeyword.trim();
      if (introLetterMode === "1") q.letter_mode = "has";
      else if (introLetterMode === "2") q.letter_mode = "none";
      if (introLetterLower === "1") q.letter_lower = 1;
      if (introDigit === "1") q.digit = 1;
      if (introCnDigit === "1") q.cn_digit = 1;
      const page = await adminEndpoints.memberMediaIntros(q);
      setIntroRows(page.items);
      setIntroEdits({});
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "加载失败", "error");
    } finally {
      setIntroLoading(false);
    }
  };

  const avatarReviewStatus = (): number | undefined => {
    if (avatarStatus1 === "1") return 0;
    if (avatarStatus1 === "2") return 1;
    if (avatarStatus2 === "1") return 1;
    if (avatarStatus2 === "") return 2; // 下拉②默认「未通过」=2
    return undefined;
  };

  const loadAvatar = async () => {
    setAvatarLoading(true);
    try {
      const q: MemberMediaQuery = { media_type: "avatar", page: 1, page_size: 20 };
      const rs = avatarReviewStatus();
      if (rs !== undefined) q.review_status = rs;
      if (avatarGender === "1") q.gender = 1;
      else if (avatarGender === "2") q.gender = 2;
      if (avatarKeyword.trim()) q.keyword = avatarKeyword.trim();
      const page = await adminEndpoints.memberMediaList(q);
      setAvatarRows(page.items);
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "加载失败", "error");
    } finally {
      setAvatarLoading(false);
    }
  };

  const loadMedia = async (type: MemberMediaType) => {
    setMediaLoading(true);
    try {
      const q: MemberMediaQuery = { media_type: type, page: 1, page_size: 20 };
      if (mediaKeyword.trim()) q.keyword = mediaKeyword.trim();
      const page = await adminEndpoints.memberMediaList(q);
      setMediaRows(page.items);
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "加载失败", "error");
    } finally {
      setMediaLoading(false);
    }
  };

  // Tab 切换按需加载
  useEffect(() => {
    if (tab === "intro") void loadIntro();
    else if (tab === "avatar") void loadAvatar();
    else if (tab === "photo") void loadMedia("photo");
    else if (tab === "video") void loadMedia("video");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  // ─── 个人介绍：编辑自白 ────────────────────────────────────
  const introValue = (row: MemberIntroItem): string =>
    introEdits[row.user_id] !== undefined ? introEdits[row.user_id] : (row.self_intro ?? "");

  const onIntroChange = (userId: number, val: string) =>
    setIntroEdits((m) => ({ ...m, [userId]: val }));

  const onIntroSave = async (row: MemberIntroItem) => {
    const val = introValue(row);
    try {
      const updated = await adminEndpoints.updateMemberIntro(row.user_id, { self_intro: val });
      setIntroRows((rows) => rows.map((r) => (r.user_id === row.user_id ? { ...r, self_intro: updated.self_intro, updated_at: updated.updated_at } : r)));
      showConfigToast("已保存", "ok");
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "保存失败", "error");
    }
  };

  // ─── 头像：审核/重新上传/历史 ──────────────────────────────
  const onRejectAvatar = async (row: MemberMediaItem) => {
    try {
      await adminEndpoints.reviewMemberMedia(row.id, { review_status: 2 });
      showConfigToast("已设为不通过", "ok");
      await loadAvatar();
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "审核失败", "error");
    }
  };

  const onReuploadClick = (id: number) => {
    setPendingReplaceId(id);
    uploadInputRef.current?.click();
  };

  const onFilePicked = (file: File | undefined | null) => {
    const id = pendingReplaceId;
    setPendingReplaceId(null);
    pickAndUploadImage(
      file,
      (url) => {
        if (id == null) return;
        adminEndpoints
          .replaceMemberMedia(id, { file_url: url })
          .then(() => {
            showConfigToast("已重新上传，等待审核", "ok");
            return loadAvatar();
          })
          .catch((err) => showConfigToast(err instanceof Error ? err.message : "重新上传失败", "error"));
      },
      (msg) => showConfigToast(msg, "error"),
    );
  };

  const openHistory = async (userId: number) => {
    setHistory({ open: true, userId, items: [], loading: true });
    try {
      const page = await adminEndpoints.memberMediaHistory(userId, { page: 1, page_size: 20 });
      setHistory((h) => ({ ...h, items: page.items, loading: false }));
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "加载失败", "error");
      setHistory((h) => ({ ...h, loading: false }));
    }
  };

  const closeHistory = () => setHistory((h) => ({ ...h, open: false }));

  const mediaCover: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
  };

  const emptyStyle: React.CSSProperties = { padding: "40px 0", textAlign: "center", color: "#999", fontSize: 14 };

  return (
    <div className="min-w-0">
      <AdminBreadcrumb items={[...getBreadcrumb("会员CRM", "内容核查"), { label }]} />

      <section className="cvr-card">
        <div className="cvr-tabs">
          {tabs.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`cvr-tab ${tab === item.key ? "active" : ""}`}
              onClick={() => setTab(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* ============ 个人介绍 ============ */}
        {tab === "intro" && (
          <>
            <div className="cvr-notice">
              <div className="cvr-notice-title">
                <span className="cvr-notice-icon">!</span>
                须知
              </div>
              <p>
                您可以在这里快速浏览到平台所有会员的个人自白（介绍），并能够进行编辑修改。能够帮助您更加准确、高效的了解会员的信息和择偶需求，以及对平台中会员个人介绍的快捷管理。
              </p>
            </div>

            <div className="cvr-filter">
              <div className="cvr-selects">
                <label className="cvr-select">
                  <select value={introLetterMode} onChange={(e) => setIntroLetterMode(e.target.value)}>
                    <option value="">不限</option>
                    <option value="1">含有英文字母</option>
                    <option value="2">不含有英文字母</option>
                  </select>
                  <ChevronDown className="cvr-caret" />
                </label>
                <label className="cvr-select">
                  <select value={introLetterLower} onChange={(e) => setIntroLetterLower(e.target.value)}>
                    <option value="1">含有英文字母(a-z)</option>
                    <option value="0">不限</option>
                  </select>
                  <ChevronDown className="cvr-caret" />
                </label>
                <label className="cvr-select">
                  <select value={introDigit} onChange={(e) => setIntroDigit(e.target.value)}>
                    <option value="1">含有数字(0-9)</option>
                    <option value="0">不限</option>
                  </select>
                  <ChevronDown className="cvr-caret" />
                </label>
                <label className="cvr-select">
                  <select value={introCnDigit} onChange={(e) => setIntroCnDigit(e.target.value)}>
                    <option value="1">含有中文数字(零到九)</option>
                    <option value="0">不限</option>
                  </select>
                  <ChevronDown className="cvr-caret" />
                </label>
              </div>
              <div className="cvr-filter-right">
                <label className="cvr-searchbox">
                  <span className="cvr-search-prefix">按昵称搜</span>
                  <input
                    type="text"
                    placeholder="请输入"
                    value={introKeyword}
                    onChange={(e) => setIntroKeyword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && loadIntro()}
                  />
                </label>
                <button type="button" className="cvr-btn primary" onClick={() => loadIntro()}>
                  <Search className="size-3.5" />
                  搜索
                </button>
              </div>
            </div>

            <div className="cvr-table-wrap">
              <table className="cvr-table">
                <colgroup>
                  <col style={{ width: 240 }} />
                  <col />
                  <col style={{ width: 190 }} />
                  <col style={{ width: 100 }} />
                </colgroup>
                <thead>
                  <tr>
                    <th>会员</th>
                    <th>自白内容(个人介绍)</th>
                    <th>修改时间</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {introLoading ? (
                    <tr>
                      <td colSpan={4} style={emptyStyle}>加载中...</td>
                    </tr>
                  ) : introRows.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={emptyStyle}>暂无数据</td>
                    </tr>
                  ) : (
                    introRows.map((row) => (
                      <tr key={row.user_id}>
                        <td>
                          <div className="cvr-member">
                            <span className="cvr-avatar" style={row.avatar ? { backgroundImage: `url(${resolveMediaUrl(row.avatar) ?? ""})`, backgroundSize: "cover" } : undefined} />
                            <div className="cvr-member-info">
                              <div className="cvr-member-nick">{row.nickname ?? "未命名"}</div>
                              <div className="cvr-member-code">编号：{row.member_code}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <input
                            type="text"
                            className="cvr-content-input"
                            value={introValue(row)}
                            placeholder="仅限500字"
                            maxLength={500}
                            onChange={(e) => onIntroChange(row.user_id, e.target.value)}
                            onBlur={() => onIntroSave(row)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                (e.target as HTMLInputElement).blur();
                              }
                            }}
                          />
                        </td>
                        <td className="cvr-time">{fmtDateTime(row.updated_at)}</td>
                        <td>
                          <button type="button" className="cvr-link" onClick={() => setProfile({ memberId: row.user_id, nickname: row.nickname, memberCode: row.member_code })}>
                            查看资料
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ============ 头像 ============ */}
        {tab === "avatar" && (
          <>
            <div className="cvr-notice">
              <div className="cvr-notice-title">
                <span className="cvr-notice-icon">!</span>
                须知
              </div>
              <p>
                会员的头像的真实性、美观度对平台极为重要，管理和优化好会员头像将大大提升您平台的形象和吸引力。
              </p>
              <p>
                本页中列出平台中所有会员上传的照片头像，方便平台红娘或管理人员全面浏览会员头像，有助于高效筛选或优化对方会员头像进行集中化管理。
              </p>
              <p>
                设为不准：将会员的头像删除并自动设为系统头像，系统会自动发送提醒旧会员头像审核未通过并要求重新上传头像，重新上传新上传的头像将覆盖原头像。
              </p>
              <p>
                历史头像：是指会员上传过的所有头像的记录，该功能一定程度上帮助平台了解到会员的变动真实性。
              </p>
            </div>

            <div className="cvr-filter">
              <div className="cvr-selects">
                <label className="cvr-select">
                  <select value={avatarStatus1} onChange={(e) => setAvatarStatus1(e.target.value)}>
                    <option value="">不限</option>
                    <option value="1">待审核</option>
                    <option value="2">已通过</option>
                  </select>
                  <ChevronDown className="cvr-caret" />
                </label>
                <label className="cvr-select">
                  <select value={avatarStatus2} onChange={(e) => setAvatarStatus2(e.target.value)}>
                    <option value="">未通过</option>
                    <option value="1">已通过</option>
                  </select>
                  <ChevronDown className="cvr-caret" />
                </label>
                <label className="cvr-select">
                  <span className="cvr-select-prefix">性别:</span>
                  <select value={avatarGender} onChange={(e) => setAvatarGender(e.target.value)}>
                    <option value="">不限</option>
                    <option value="1">男</option>
                    <option value="2">女</option>
                  </select>
                  <ChevronDown className="cvr-caret" />
                </label>
              </div>
              <div className="cvr-filter-right">
                <label className="cvr-searchbox">
                  <span className="cvr-search-prefix">按昵称搜</span>
                  <input
                    type="text"
                    placeholder="请输入昵称"
                    value={avatarKeyword}
                    onChange={(e) => setAvatarKeyword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && loadAvatar()}
                  />
                </label>
                <button type="button" className="cvr-btn primary" onClick={() => loadAvatar()}>
                  <Search className="size-3.5" />
                  搜索
                </button>
              </div>
            </div>

            <div className="cvr-avatar-grid">
              {avatarLoading ? (
                <div style={emptyStyle}>加载中...</div>
              ) : avatarRows.length === 0 ? (
                <div style={emptyStyle}>暂无数据</div>
              ) : (
                avatarRows.map((row) => (
                  <div key={row.id} className="cvr-avatar-card">
                    <div className="cvr-avatar-media">
                      {row.file_url ? <img src={resolveMediaUrl(row.file_url) ?? ""} alt="" style={mediaCover} /> : null}
                      {row.age != null && <span className="cvr-avatar-age">{row.age}岁</span>}
                      <button type="button" className="cvr-media-icon" onClick={() => loadAvatar()}>
                        <RefreshCw className="size-3.5" />
                      </button>
                      {row.meta_text && <span className="cvr-avatar-meta">{row.meta_text}</span>}
                    </div>
                    <div className="cvr-avatar-foot">
                      <span className="cvr-avatar-name">
                        {row.nickname}
                        {row.member_code && <span className="cvr-avatar-code"> ({row.member_code})</span>}
                      </span>
                      <button type="button" className="cvr-link" onClick={() => setProfile({ memberId: row.user_id, nickname: row.nickname, memberCode: row.member_code })}>
                        详情
                      </button>
                    </div>
                    <div className="cvr-avatar-actions">
                      <button type="button" className="cvr-chip" onClick={() => onRejectAvatar(row)}>
                        不通过
                      </button>
                      <button type="button" className="cvr-chip" onClick={() => onReuploadClick(row.id)}>
                        重新上传
                      </button>
                      <button type="button" className="cvr-chip" onClick={() => openHistory(row.user_id)}>
                        历史头像
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* ============ 照片 ============ */}
        {tab === "photo" && (
          <>
            <div className="cvr-notice">
              <div className="cvr-notice-title">
                <span className="cvr-notice-icon">!</span>
                须知
              </div>
              <p>
                本页中列出平台中所有会员上传的照片，方便平台红娘或管理人员快速全面浏览会员照片，有助于更加高效直观的了解会员，并可以对不合规的照片及时删除
              </p>
            </div>

            <div className="cvr-filter">
              <div className="cvr-filter-right">
                <label className="cvr-searchbox">
                  <input
                    type="text"
                    placeholder="请输入昵称/编号"
                    value={mediaKeyword}
                    onChange={(e) => setMediaKeyword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && loadMedia("photo")}
                  />
                </label>
                <button type="button" className="cvr-btn primary" onClick={() => loadMedia("photo")}>
                  <Search className="size-3.5" />
                  搜索
                </button>
              </div>
            </div>

            <div className="cvr-media-grid">
              {mediaLoading ? (
                <div style={emptyStyle}>加载中...</div>
              ) : mediaRows.length === 0 ? (
                <div style={emptyStyle}>暂无数据</div>
              ) : (
                mediaRows.map((row) => (
                  <div key={row.id} className="cvr-media-card">
                    <span className="cvr-media-tag">
                      <Camera className="size-3.5" />
                    </span>
                    <button type="button" className="cvr-media-icon">
                      <ImageIcon className="size-3.5" />
                    </button>
                    {row.file_url ? <img src={resolveMediaUrl(row.file_url) ?? ""} alt="" style={mediaCover} /> : null}
                    {row.nickname && (
                      <span className="cvr-media-name">
                        {row.nickname}(编号{row.member_code})
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* ============ 视频 ============ */}
        {tab === "video" && (
          <>
            <div className="cvr-notice">
              <div className="cvr-notice-title">
                <span className="cvr-notice-icon">!</span>
                须知
              </div>
              <p>
                本页中列出平台中所有会员上传的照片和视频，方便平台红娘或管理人员快速全面浏览会员照片，有助于更加高效直观的了解会员，并可以对不合规的照片及时删除
              </p>
            </div>

            <div className="cvr-filter">
              <div className="cvr-filter-right">
                <label className="cvr-searchbox">
                  <input
                    type="text"
                    placeholder="请输入昵称/编号"
                    value={mediaKeyword}
                    onChange={(e) => setMediaKeyword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && loadMedia("video")}
                  />
                </label>
                <button type="button" className="cvr-btn primary" onClick={() => loadMedia("video")}>
                  <Search className="size-3.5" />
                  搜索
                </button>
              </div>
            </div>

            <div className="cvr-video-grid">
              {mediaLoading ? (
                <div style={emptyStyle}>加载中...</div>
              ) : mediaRows.length === 0 ? (
                <div style={emptyStyle}>暂无数据</div>
              ) : (
                mediaRows.map((row) => {
                  const cover = row.thumbnail_url ?? row.file_url;
                  return (
                    <div key={row.id} className="cvr-media-card video">
                      <span className="cvr-media-tag">
                        <Video className="size-3.5" />
                      </span>
                      <button type="button" className="cvr-media-icon">
                        <Video className="size-3.5" />
                      </button>
                      {cover ? <img src={resolveMediaUrl(cover) ?? ""} alt="" style={mediaCover} /> : null}
                      <span className="cvr-play">
                        <Play className="size-4" />
                      </span>
                      {row.nickname && (
                        <span className="cvr-media-name">
                          {row.nickname}(编号{row.member_code})
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </section>

      {/* ============ 历史头像弹窗 ============ */}
      {history.open && (
        <div className="cvr-history-mask" onClick={closeHistory}>
          <div className="cvr-history-panel" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="cvr-history-head">
              <h2>历史头像</h2>
              <button type="button" className="cvr-history-x" onClick={closeHistory}>
                <X className="size-4" />
              </button>
            </div>
            <div className="cvr-history-body">
              {history.loading ? (
                <div style={emptyStyle}>加载中...</div>
              ) : history.items.length === 0 ? (
                <div style={emptyStyle}>暂无数据</div>
              ) : (
                <div className="cvr-history-grid">
                  {history.items.map((it) => (
                    <div key={it.id} className="cvr-history-item">
                      {it.file_url ? <img src={resolveMediaUrl(it.file_url) ?? ""} alt="" /> : null}
                      <span className="cvr-history-status">{it.review_status_label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 重新上传：隐藏文件选择 */}
      <input
        ref={uploadInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => onFilePicked(e.target.files?.[0])}
      />

      {profile && (
        <MemberQuickProfileDrawer
          memberId={profile.memberId}
          nickname={profile.nickname}
          memberCode={profile.memberCode}
          onClose={() => setProfile(null)}
        />
      )}
    </div>
  );
}
