"use client";
import { useState } from "react";
import { X, Upload } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";

const breadcrumb = [
  { label: "首页", href: "/" },
  { label: "运营工具", href: "/free-pay" },
  { label: "红娘喜讯", href: "/xixun-menu" },
  { label: "喜讯管理" },
];

interface XixunRow {
  id: number;
  time: string;
  publisher: string;
  feedback: string;
  partner: string;
  meetDur: string;
  status: string;
  matchmaker: string;
  blessing: string;
  views: number;
  public: boolean;
}

const rows: XixunRow[] = [
  { id: 18, time: "2026-06-14 15:09:24", publisher: "管理员\n三土", feedback: "芋头苍蝇", partner: "王八老鼠", meetDur: "1个月", status: "牵手成功", matchmaker: "琴琴", blessing: "哈哈哈，你俩就得着乐吧～", views: 3, public: true },
  { id: 17, time: "2026-06-14 15:06:28", publisher: "管理员\n三土", feedback: "茵比QQ糖", partner: "拨安", meetDur: "5个月", status: "恋恋生活", matchmaker: "芸希老师", blessing: "恭喜你们找到了彼此的人生拼图！", views: 1, public: true },
  { id: 16, time: "2026-06-14 14:51:11", publisher: "管理员\n三土", feedback: "Karo1314", partner: "久Lieb", meetDur: "12个月", status: "已办婚礼", matchmaker: "苓琴", blessing: "既然已经结婚了，那就麻烦你们继续撒糖，我负责吃瓜就好！", views: 2, public: true },
  { id: 15, time: "2026-06-14 14:46:33", publisher: "管理员\n三土", feedback: "阿布", partner: "Iris", meetDur: "15个月", status: "已验证", matchmaker: "琴琴", blessing: "祝你们岁岁常欢愉，万事皆胜意。", views: 0, public: true },
  { id: 14, time: "2026-06-14 14:42:30", publisher: "管理员\n三土", feedback: "吴先生", partner: "兰小姐", meetDur: "2个月", status: "牵手成功", matchmaker: "芸希老师", blessing: "从今以后，风有风，海有海，你们有彼此。愿你们无论多远，都彼此相依。", views: 0, public: true },
  { id: 13, time: "2026-06-13 11:39:45", publisher: "管理员\n三土", feedback: "夏天", partner: "娜娜", meetDur: "6个月", status: "已订婚", matchmaker: "芸希老师", blessing: "恭喜你们找到了彼此的人生拼图。从此三餐四季，温柔有趣，冷暖有", views: 2, public: true },
];

export default function XixunListPage() {
  const [addOpen, setAddOpen] = useState(false);
  const [fbType, setFbType] = useState("库中会员");
  const [ptType, setPtType] = useState("库中会员");

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      {/* 蓝色须知条 */}
      <div className="ecl-notice">
        <div className="ecl-notice-body">
          <span className="ecl-notice-ic">◇</span>
          <div className="ecl-notice-text">
            <div className="ecl-notice-title">须知</div>
            <p>红娘每天工作中需对客户保持跟进回访，了解情感进展，收集他们的反馈。可将客户的反馈内容、聊天截图等作为喜讯，添加到系统中集中展示在平台中展示给公众号</p>
            <p>红娘也可以积极鼓励和引导成功客户在平台中主动提交反馈，由在平台工作人员编辑完善后，在平台中展示给公众号</p>
            <p>超级红娘可查看、管理全平台喜讯；普通红娘仅查看、管理服务红娘是本人，以及自己发布添加的喜讯内容</p>
          </div>
        </div>
      </div>

      <div className="finord-card">
        {/* 筛选条 */}
        <div className="finord-filters xl-filters">
          <select className="finord-select">
            <option>按状态分类</option>
            <option>牵手成功</option>
            <option>已订婚</option>
            <option>已办婚礼</option>
          </select>
          <select className="finord-select">
            <option>按服务红娘筛选</option>
            <option>琴琴</option>
            <option>芸希老师</option>
            <option>苓琴</option>
          </select>
          <button className="finord-btn finord-btn-primary" onClick={() => setAddOpen(true)}>添加喜讯</button>
        </div>

        {/* 表格 */}
        <div className="finord-table-wrap">
          <table className="finord-table xl-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>添加时间</th>
                <th>发布人</th>
                <th>反馈方</th>
                <th>交住方</th>
                <th>相识时间</th>
                <th>情感状态</th>
                <th>服务红娘</th>
                <th>红娘祝福</th>
                <th>浏览次数</th>
                <th>平台公开展示</th>
                <th>链接/二维码</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="finord-id">{r.id}</td>
                  <td className="xl-time">{r.time}</td>
                  <td className="xl-publisher">{r.publisher}</td>
                  <td>{r.feedback}</td>
                  <td>{r.partner}</td>
                  <td>{r.meetDur}</td>
                  <td>{r.status}</td>
                  <td>{r.matchmaker}</td>
                  <td className="xl-blessing">{r.blessing}</td>
                  <td>{r.views}</td>
                  <td>
                    <button
                      type="button"
                      className={`mp-switch ${r.public ? "on" : ""}`}
                      onClick={() => {}}
                    >
                      {r.public && <span className="mp-switch-label">开</span>}
                      <span className="mp-switch-knob"></span>
                    </button>
                  </td>
                  <td>
                    <a className="finord-link" href="#">查看</a>
                  </td>
                  <td>
                    <span className="xl-ops">
                      <a className="finord-link" href="#">编辑/查看</a>
                      <span className="cs-op-sep">|</span>
                      <a className="finord-link" href="#">删除</a>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 分页 */}
        <div className="finord-pagination">
          <div className="finord-pages">
            <button className="finord-page nav" disabled>&lsaquo;</button>
            <button className="finord-page active">1</button>
            <button className="finord-page nav" disabled>&rsaquo;</button>
          </div>
        </div>
      </div>

      {addOpen && (
        <>
          <div className="tlc-mask" onClick={() => setAddOpen(false)} />
          <div className="tlc-panel xx-panel">
            <div className="tlc-panel-head">
              <div className="tlc-panel-head-left">
                <button className="tlc-x" onClick={() => setAddOpen(false)} aria-label="关闭"><X size={18} /></button>
                <span className="tlc-panel-title">添加/编辑喜讯</span>
              </div>
              <div className="xx-head-actions">
            <button className="finord-btn xx-cancel" onClick={() => setAddOpen(false)}>关闭</button>
                <button className="finord-btn finord-btn-primary">确定提交</button>
              </div>
            </div>
            <div className="tlc-panel-body">
              {/* 反馈方 */}
              <div className="xx-row">
                <span className="xx-label">＊反馈方</span>
                <div className="xx-content">
                  <div className="xx-options">
                    {["库中会员", "自定义"].map((o) => (
                      <label key={o} className={`xx-radio ${fbType === o ? "active" : ""}`}>
                        <input type="radio" name="fbType" value={o} checked={fbType === o} onChange={() => setFbType(o)} />
                        <span>{o}</span>
                      </label>
                    ))}
                  </div>
                  <input className="xx-input xx-input-wide" placeholder="输入昵称关键词" />
                </div>
              </div>

              {/* 交住方 */}
              <div className="xx-row">
                <span className="xx-label">＊交住方</span>
                <div className="xx-content">
                  <div className="xx-options">
                    {["库中会员", "自定义"].map((o) => (
                      <label key={o} className={`xx-radio ${ptType === o ? "active" : ""}`}>
                        <input type="radio" name="ptType" value={o} checked={ptType === o} onChange={() => setPtType(o)} />
                        <span>{o}</span>
                      </label>
                    ))}
                  </div>
                  <input className="xx-input xx-input-wide" placeholder="输入昵称关键词" />
                </div>
              </div>

              {/* 交往时间 */}
              <div className="xx-row">
                <span className="xx-label">＊交往时间</span>
                <div className="xx-content">
                  <div className="xx-inline">
                    <input className="xx-input" placeholder="只能填写数字" />
                    <span className="xx-unit">个月</span>
                  </div>
                </div>
              </div>

              {/* 情感状态 */}
              <div className="xx-row">
                <span className="xx-label">＊情感状态</span>
                <div className="xx-content">
                  <select className="xx-select xx-select-wide">
                    <option>请选择情感状态</option>
                    <option>牵手成功</option>
                    <option>已订婚</option>
                    <option>已办婚礼</option>
                    <option>已验证</option>
                    <option>恋恋生活</option>
                  </select>
                </div>
              </div>

              {/* 服务红娘 */}
              <div className="xx-row">
                <span className="xx-label">＊服务红娘</span>
                <div className="xx-content">
                  <select className="xx-select xx-select-wide">
                    <option>请选择服务红娘</option>
                    <option>芸希老师</option>
                    <option>琴琴</option>
                    <option>苓琴</option>
                  </select>
                </div>
              </div>

              {/* 喜讯内容 */}
              <div className="xx-row">
                <span className="xx-label">＊喜讯内容</span>
                <div className="xx-content">
                  <textarea className="xx-textarea" placeholder="支持段落排版" rows={6} />
                  <div className="xx-upload-row">
                    <button type="button" className="xx-upload-btn-line"><Upload size={14} /> 图片上传/管理（支持移动排序、删除）</button>
                  </div>
                </div>
              </div>

              {/* 显示排序 */}
              <div className="xx-row">
                <span className="xx-label">显示排序</span>
                <div className="xx-content">
                  <input className="xx-input xx-input-num" />
                  <div className="xx-info">① 数字越大显示越靠前</div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
