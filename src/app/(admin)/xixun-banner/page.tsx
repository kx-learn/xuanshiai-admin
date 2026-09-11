"use client";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";

const breadcrumb = [
  { label: "首页", href: "/" },
  { label: "运营工具", href: "/free-pay" },
  { label: "红娘喜讯", href: "/xixun-menu" },
  { label: "锦旗管理" },
];

interface BannerRow {
  time: string;
  maker: string;
  from: string;
  to: string;
  words: string;
  public: boolean;
}

const rows: BannerRow[] = [
  { time: "2026-06-12 18:02:15", maker: "用户\nFairy", from: "杜杜&林林", to: "琴琴老师", words: "邂逅真爱 感恩相伴", public: true },
  { time: "2026-06-12 18:00:32", maker: "用户\nFairy", from: "吴先生@韩小姐", to: "芸希老师", words: "用心搭佳缘 温暖伴余生", public: true },
  { time: "2026-06-12 17:59:03", maker: "用户\nFairy", from: "张女士@杨先生", to: "南京红姐", words: "结缘遇良人 感恩引路人", public: true },
  { time: "2026-06-12 17:57:23", maker: "用户\nFairy", from: "小赵&小宋", to: "琴琴老师", words: "感谢红娘牵线 成就美好姻缘", public: true },
  { time: "2026-06-12 17:56:25", maker: "用户\nFairy", from: "王小姐&王先生", to: "南京红姐", words: "巧手牵红线 喜遇心上人", public: true },
  { time: "2026-06-12 17:55:32", maker: "用户\nFairy", from: "宋小姐&董先生", to: "南京红姐", words: "一线遇真爱 慧眼识良缘", public: true },
  { time: "2026-06-12 17:54:24", maker: "用户\nFairy", from: "图图&壮壮", to: "南京红姐", words: "金牌牵线官 脱单大功臣", public: true },
  { time: "2026-06-12 17:52:22", maker: "用户\nFairy", from: "夏天&婉婉", to: "芸希老师", words: "月老下凡牵线 红娘点成良缘", public: true },
  { time: "2026-06-12 17:51:11", maker: "用户\nFairy", from: "小刘&小姚", to: "琴琴老师", words: "热心牵线搭桥 促成美满姻缘", public: true },
  { time: "2026-06-12 17:49:41", maker: "用户\nFairy", from: "徐先生&文小姐", to: "芸希老师", words: "尽心牵红线 善举结良缘", public: true },
];

export default function XixunBannerPage() {
  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      {/* 蓝色须知条 */}
      <div className="ecl-notice">
        <div className="ecl-notice-body">
          <span className="ecl-notice-ic">◇</span>
          <div className="ecl-notice-text">
            <div className="ecl-notice-title">须知</div>
            <p>本系统中研发了锦旗在线制作功能，只需输入赠语即可快速生成一面电子锦旗</p>
            <p>红娘在与会员的日常跟进中可引导会员在平台上制作赠送"电子锦旗"，锦旗会在平台上进行展示</p>
            <p>您可以将电子锦旗自行在文印店中制作为实物锦旗悬挂于您的门店中</p>
            <p><a className="xj-entry" href="#">在线制作锦旗入口</a></p>
          </div>
        </div>
      </div>

      <div className="finord-card">
        {/* 表格 */}
        <div className="finord-table-wrap">
          <table className="finord-table xj-table">
            <thead>
              <tr>
                <th>赠送时间</th>
                <th>制作人</th>
                <th>赠送人</th>
                <th>赠送给</th>
                <th>赠送语</th>
                <th>平台公开展示</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.time}>
                  <td className="xj-time">{r.time}</td>
                  <td className="xj-maker">{r.maker}</td>
                  <td>{r.from}</td>
                  <td>{r.to}</td>
                  <td className="xj-words">{r.words}</td>
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
                    <span className="xj-ops">
                      <a className="finord-link" href="#">下载保存</a>
                      <a className="finord-link" href="#">链接/二维码</a>
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
    </div>
  );
}
