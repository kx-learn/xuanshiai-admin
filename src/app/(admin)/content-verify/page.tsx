"use client";

import { useState } from "react";
import {
  Camera,
  ChevronDown,
  Image as ImageIcon,
  Play,
  RefreshCw,
  Search,
  Video,
} from "lucide-react";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";

type Tab = "intro" | "avatar" | "photo" | "video";

const tabs: { key: Tab; label: string }[] = [
  { key: "intro", label: "个人介绍" },
  { key: "avatar", label: "头像" },
  { key: "photo", label: "照片" },
  { key: "video", label: "视频" },
];

/* ---------- 个人介绍 ---------- */
type IntroRow = { nick: string; code: string; content: string; time: string; g: string };

const introRows: IntroRow[] = [
  { nick: "Lemon", code: "B696945", content: "", time: "2026-09-01 14:46:13", g: "a" },
  { nick: "尔尔", code: "G522362", content: "111", time: "2026-08-27 09:35:27", g: "b" },
  { nick: "llll", code: "G396140", content: "", time: "2026-08-21 10:48:23", g: "c" },
  { nick: "O_o0P9", code: "G239989", content: "", time: "2026-07-20 23:10:58", g: "d" },
  { nick: "小可爱", code: "G424118", content: "", time: "2026-07-20 14:42:24", g: "e" },
  { nick: "aaa", code: "G437253", content: "", time: "2026-07-20 14:34:46", g: "f" },
  { nick: "梧桐", code: "G535776", content: "在211大学当老师，喜欢运动（网球、健身、游泳等），热爱生活", time: "2026-07-19 18:37:28", g: "g" },
  { nick: "禾禾禾", code: "G944467", content: "", time: "2026-07-19 08:54:35", g: "h" },
];

/* ---------- 头像 ---------- */
type AvatarCard = { nick: string; code: string; age: string; meta: string; g: string };

const avatarCards: AvatarCard[] = [
  { nick: "Lemon", code: "B965945", age: "23↑", meta: "1990年 175cm 大专", g: "a" },
  { nick: "lll", code: "G396140", age: "19岁", meta: "19岁 170cm 大专", g: "b" },
  { nick: "尔尔", code: "G522362", age: "", meta: "2002年 165cm 博士", g: "c" },
  { nick: "小可爱", code: "G424118", age: "", meta: "10岁 230cm 博士", g: "d" },
  { nick: "aaa", code: "G437253", age: "", meta: "1990年 175cm 博士", g: "e" },
  { nick: "", code: "", age: "", meta: "1993年 170cm 博士", g: "f" },
  { nick: "", code: "", age: "", meta: "1997年 165cm 硕士", g: "g" },
  { nick: "", code: "", age: "", meta: "2004年 165cm 本科", g: "h" },
  { nick: "", code: "", age: "", meta: "1990年 175cm 本科", g: "i" },
];

/* ---------- 照片 ---------- */
type MediaCard = { nick: string; code: string; g: string };

const photoCards: MediaCard[] = [
  { nick: "rasin", code: "G847150", g: "a" },
  { nick: "rasin", code: "G847150", g: "b" },
  { nick: "rasin", code: "G847150", g: "c" },
  { nick: "Thera", code: "G824771", g: "d" },
  { nick: "Thera", code: "G824771", g: "e" },
  { nick: "rasin", code: "G847150", g: "f" },
  { nick: "rasin", code: "G847150", g: "g" },
  { nick: "rasin", code: "G847150", g: "h" },
  { nick: "", code: "", g: "i" },
  { nick: "", code: "", g: "j" },
];

/* ---------- 视频 ---------- */
const videoCards: MediaCard[] = [
  { nick: "Thera", code: "G824771", g: "a" },
  { nick: "yq", code: "G646651", g: "b" },
  { nick: "yq", code: "G646651", g: "c" },
  { nick: "", code: "", g: "d" },
];

export default function ContentVerifyPage() {
  const [tab, setTab] = useState<Tab>("intro");
  const label = tabs.find((item) => item.key === tab)?.label ?? "个人介绍";

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
                  <select defaultValue="">
                    <option value="">不限</option>
                    <option value="1">含有英文字母</option>
                    <option value="2">不含有英文字母</option>
                  </select>
                  <ChevronDown className="cvr-caret" />
                </label>
                <label className="cvr-select">
                  <select defaultValue="1">
                    <option value="1">含有英文字母(a-z)</option>
                    <option value="0">不限</option>
                  </select>
                  <ChevronDown className="cvr-caret" />
                </label>
                <label className="cvr-select">
                  <select defaultValue="1">
                    <option value="1">含有数字(0-9)</option>
                    <option value="0">不限</option>
                  </select>
                  <ChevronDown className="cvr-caret" />
                </label>
                <label className="cvr-select">
                  <select defaultValue="1">
                    <option value="1">含有中文数字(零到九)</option>
                    <option value="0">不限</option>
                  </select>
                  <ChevronDown className="cvr-caret" />
                </label>
              </div>
              <div className="cvr-filter-right">
                <label className="cvr-searchbox">
                  <span className="cvr-search-prefix">按昵称搜</span>
                  <input type="text" placeholder="请输入" />
                </label>
                <button type="button" className="cvr-btn primary">
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
                  {introRows.map((row, index) => (
                    <tr key={`${row.nick}-${index}`}>
                      <td>
                        <div className="cvr-member">
                          <span className={`cvr-avatar cvr-g-${row.g}`} />
                          <div className="cvr-member-info">
                            <div className="cvr-member-nick">{row.nick}</div>
                            <div className="cvr-member-code">编号：{row.code}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <input
                          type="text"
                          className="cvr-content-input"
                          defaultValue={row.content}
                          placeholder="仅限500字"
                        />
                      </td>
                      <td className="cvr-time">{row.time}</td>
                      <td>
                        <button type="button" className="cvr-link">
                          查看资料
                        </button>
                      </td>
                    </tr>
                  ))}
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
                  <select defaultValue="">
                    <option value="">不限</option>
                    <option value="1">待审核</option>
                    <option value="2">已通过</option>
                  </select>
                  <ChevronDown className="cvr-caret" />
                </label>
                <label className="cvr-select">
                  <select defaultValue="">
                    <option value="">未通过</option>
                    <option value="1">已通过</option>
                  </select>
                  <ChevronDown className="cvr-caret" />
                </label>
                <label className="cvr-select">
                  <span className="cvr-select-prefix">性别:</span>
                  <select defaultValue="">
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
                  <input type="text" placeholder="请输入昵称" />
                </label>
                <button type="button" className="cvr-btn primary">
                  搜索
                </button>
              </div>
            </div>

            <div className="cvr-avatar-grid">
              {avatarCards.map((card, index) => (
                <div key={index} className="cvr-avatar-card">
                  <div className={`cvr-avatar-media cvr-g-${card.g}`}>
                    {card.age && <span className="cvr-avatar-age">{card.age}</span>}
                    <button type="button" className="cvr-media-icon">
                      <RefreshCw className="size-3.5" />
                    </button>
                    <span className="cvr-avatar-meta">{card.meta}</span>
                  </div>
                  <div className="cvr-avatar-foot">
                    <span className="cvr-avatar-name">
                      {card.nick}
                      {card.code && <span className="cvr-avatar-code"> ({card.code})</span>}
                    </span>
                    <button type="button" className="cvr-link">
                      详情
                    </button>
                  </div>
                  <div className="cvr-avatar-actions">
                    <button type="button" className="cvr-chip">
                      不通过
                    </button>
                    <button type="button" className="cvr-chip">
                      重新上传
                    </button>
                    <button type="button" className="cvr-chip">
                      历史头像
                    </button>
                  </div>
                </div>
              ))}
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
                  <input type="text" placeholder="请输入昵称/编号" />
                </label>
                <button type="button" className="cvr-btn primary">
                  搜索
                </button>
              </div>
            </div>

            <div className="cvr-media-grid">
              {photoCards.map((card, index) => (
                <div key={index} className={`cvr-media-card cvr-g-${card.g}`}>
                  <span className="cvr-media-tag">
                    <Camera className="size-3.5" />
                  </span>
                  <button type="button" className="cvr-media-icon">
                    <ImageIcon className="size-3.5" />
                  </button>
                  {card.nick && (
                    <span className="cvr-media-name">
                      {card.nick}(编号{card.code})
                    </span>
                  )}
                </div>
              ))}
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
                  <input type="text" placeholder="请输入昵称/编号" />
                </label>
                <button type="button" className="cvr-btn primary">
                  搜索
                </button>
              </div>
            </div>

            <div className="cvr-video-grid">
              {videoCards.map((card, index) => (
                <div key={index} className={`cvr-media-card video cvr-g-${card.g}`}>
                  <span className="cvr-media-tag">
                    <Video className="size-3.5" />
                  </span>
                  <button type="button" className="cvr-media-icon">
                    <Video className="size-3.5" />
                  </button>
                  <span className="cvr-play">
                    <Play className="size-4" />
                  </span>
                  {card.nick && (
                    <span className="cvr-media-name">
                      {card.nick}(编号{card.code})
                    </span>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
