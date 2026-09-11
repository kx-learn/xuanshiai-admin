"use client";

import { useState } from "react";
import {
  ChevronDown,
  Image as ImageIcon,
  Inbox,
  Plus,
  Search,
  Settings,
  X,
} from "lucide-react";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";

type AuthTab = "realname" | "commitment" | "marriage" | "house" | "education" | "other";

const tabs: { key: AuthTab; label: string }[] = [
  { key: "realname", label: "实名认证" },
  { key: "commitment", label: "会员承诺" },
  { key: "marriage", label: "婚姻状况" },
  { key: "house", label: "房产认证" },
  { key: "education", label: "学历认证" },
  { key: "other", label: "其他认证" },
];

/* ---------- 实名认证数据 ---------- */
const realnameStats = [
  { value: "786条", label: "人脸核验余量", recharge: true },
  { value: "361次", label: "核验成功" },
  { value: "9次", label: "核验失败" },
  { value: "364次", label: "总计消耗" },
];

type RealnameRow = {
  id: string; nick: string; code: string; name: string; idcard: string;
  gender: string; birth: string; issued: string; photo: boolean;
  method: string; vendor: string; score: string; result: "success" | "fail"; time: string;
};

const realnameRows: RealnameRow[] = [
  { id: "364", nick: "hunyun", code: "B470445", name: "王宇琪", idcard: "330105199306******", gender: "男", birth: "1993-06-15", issued: "浙江省杭州市", photo: false, method: "动作活检", vendor: "腾讯云人脸核身", score: "93.39", result: "success", time: "2026-07-12 11:14:48" },
  { id: "363", nick: "小稳", code: "B671811", name: "马鹏稳", idcard: "321284200211******", gender: "男", birth: "2002-11-03", issued: "江苏省泰州市", photo: false, method: "动作活检", vendor: "腾讯云人脸核身", score: "93.39", result: "success", time: "2026-07-09 14:07:51" },
  { id: "362", nick: "Kellen", code: "B696610", name: "徐竹轩", idcard: "320582199306******", gender: "男", birth: "1993-06-29", issued: "江苏省苏州市", photo: false, method: "照片比对", vendor: "腾讯云人脸核身", score: "95.51", result: "success", time: "2026-07-05 22:22:01" },
  { id: "361", nick: "xy", code: "B011925", name: "谢维", idcard: "440307199308******", gender: "男", birth: "2000-08-28", issued: "", photo: false, method: "动作活检", vendor: "腾讯云人脸核身", score: "96.24", result: "success", time: "2026-07-05 18:17:43" },
];

/* ---------- 会员承诺数据 ---------- */
type CommitRow = { id: string; nick: string; code: string; name: string; idcard: string; times: number; result: "pass" | "pending" | "fail"; time: string };

const commitRows: CommitRow[] = [
  { id: "343", nick: "Ellen", code: "B669610", name: "徐竹轩", idcard: "320582199306******", times: 2, result: "pending", time: "2026-07-05 22:24:42" },
  { id: "342", nick: "muf", code: "B198419", name: "杜雨枫", idcard: "420303200010******", times: 1, result: "pass", time: "2026-07-05 16:31:52" },
  { id: "341", nick: "麒", code: "B036800", name: "张毓麒", idcard: "420602199706******", times: 1, result: "pending", time: "2026-07-05 09:30:10" },
  { id: "340", nick: "普提缇", code: "G746064", name: "陶佳鹭", idcard: "310114200204******", times: 1, result: "pending", time: "2026-07-04 18:16:15" },
  { id: "339", nick: "joker", code: "B715844", name: "孙毅", idcard: "320111199602******", times: 1, result: "pending", time: "2026-07-04 10:55:52" },
  { id: "338", nick: "秋刀鱼", code: "B976071", name: "李会强", idcard: "341224199902******", times: 1, result: "pass", time: "2026-07-03 20:18:33" },
  { id: "337", nick: "是静香本人没错", code: "G858401", name: "潘蜜", idcard: "320121199309******", times: 1, result: "pending", time: "2026-07-03 15:42:07" },
  { id: "336", nick: "当叮", code: "B228260", name: "李思", idcard: "330102199505******", times: 1, result: "fail", time: "2026-07-02 19:11:20" },
];

/* ---------- 房产认证数据 ---------- */
const houseRows = [
  { id: "12", nick: "muf", code: "B198419", name: "杜雨枫", idcard: "420303200010******", file: false, result: "pass", time: "2026-07-05 16:31:52" },
  { id: "11", nick: "秋刀鱼", code: "B976071", name: "李会强", idcard: "341224199902******", file: false, result: "pass", time: "2026-07-01 16:37:20" },
  { id: "10", nick: "Sofia", code: "G410116", name: "陈林林", idcard: "420381200012******", file: true, result: "pass", time: "2026-06-30 16:54:09" },
  { id: "9", nick: "q_nd_l", code: "B134461", name: "李会强", idcard: "341224199902******", file: false, result: "pass", time: "2026-06-18 15:04:11" },
  { id: "8", nick: "kina", code: "B735680", name: "卓虹宇", idcard: "422802200512******", file: true, result: "pass", time: "2026-06-12 17:56:44" },
  { id: "7", nick: "不凡", code: "B355054", name: "杨凡", idcard: "654323456******", file: false, result: "pass", time: "2026-06-08 11:20:35" },
  { id: "6", nick: "最爱汪汪队", code: "G806737", name: "吴谦谦", idcard: "3441343434******", file: false, result: "pass", time: "2026-06-05 09:47:12" },
  { id: "5", nick: "听风者", code: "B952678", name: "郑凯", idcard: "330102199001******", file: false, result: "pass", time: "2026-06-02 14:33:58" },
];

/* ---------- 学历认证数据 ---------- */
const eduRows = [
  { id: "248", nick: "Ellen", code: "B669610", name: "徐竹轩", idcard: "320582199306******", degree: "博士", school: "罗格斯大学", file: true, result: "pass", time: "2026-07-05 22:41:13" },
  { id: "247", nick: "muf", code: "B198419", name: "杜雨枫", idcard: "420303200010******", degree: "硕士", school: "", file: false, result: "pass", time: "2026-07-05 16:31:52" },
  { id: "246", nick: "普提缇", code: "G746064", name: "陶佳鹭", idcard: "310114200204******", degree: "硕士", school: "上海师范大学", file: true, result: "pass", time: "2026-07-04 18:16:52" },
  { id: "245", nick: "joker", code: "B715844", name: "孙毅", idcard: "320111199602******", degree: "本科", school: "江苏大学", file: true, result: "pass", time: "2026-07-04 11:00:42" },
  { id: "244", nick: "秋刀鱼", code: "B976071", name: "李会强", idcard: "341224199902******", degree: "本科", school: "", file: false, result: "pass", time: "2026-07-01 16:37:20" },
  { id: "243", nick: "Sofia", code: "G410116", name: "陈林林", idcard: "420381200012******", degree: "本科", school: "南京大学", file: true, result: "pass", time: "2026-06-30 16:54:09" },
];

const statusMap: Record<string, { label: string; cls: string }> = {
  pass: { label: "通过", cls: "uath-badge pass" },
  pending: { label: "待审", cls: "uath-badge pending" },
  fail: { label: "未通过", cls: "uath-badge fail" },
};

/* ---------- 通用筛选行 ---------- */
function FilterRow({
  statusTabs,
  active,
  onStatus,
  placeholder,
  showType,
  right,
}: {
  statusTabs: string[];
  active: string;
  onStatus: (v: string) => void;
  placeholder: string;
  showType?: boolean;
  right?: React.ReactNode;
}) {
  return (
    <div className="uath-filters">
      <div className="uath-status-tabs">
        {statusTabs.map((item) => (
          <button
            key={item}
            type="button"
            className={`uath-status-tab ${active === item ? "active" : ""}`}
            onClick={() => onStatus(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="uath-filter-right">
        <label className="uath-searchbox">
          <span className="uath-search-label">按昵称搜</span>
          <input type="text" placeholder={placeholder} />
        </label>
        {showType && (
          <label className="uath-select">
            <span className="uath-select-prefix">认证类型</span>
            <select defaultValue="">
              <option value="">不限</option>
            </select>
            <ChevronDown className="uath-select-caret size-3.5" />
          </label>
        )}
        <button type="button" className="uath-btn primary">
          <Search className="size-3.5" />
          搜索
        </button>
        {right}
      </div>
    </div>
  );
}

/* ---------- 文件凭证缩略图 ---------- */
function Thumb({ kind }: { kind: "face" | "doc" | "none" }) {
  if (kind === "none") return <span className="uath-nofile">未上传</span>;
  return (
    <span className={`uath-thumb ${kind}`}>
      <ImageIcon className="size-4" />
    </span>
  );
}

export default function LoveUserAuthPage() {
  const [tab, setTab] = useState<AuthTab>("realname");
  const [drawer, setDrawer] = useState<null | "quick" | "commit" | "marriage" | "ctype">(null);
  const [ctypeMode, setCtypeMode] = useState<"list" | "create">("list");

  // 筛选状态
  const [rnStatus, setRnStatus] = useState("全部");
  const [cmStatus, setCmStatus] = useState("全部");
  const [mrStatus, setMrStatus] = useState("全部");
  const [hsStatus, setHsStatus] = useState("全部");
  const [edStatus, setEdStatus] = useState("全部");
  const [otStatus, setOtStatus] = useState("全部");

  // 承诺书表单
  const [commitTitle, setCommitTitle] = useState("单身承诺");
  const [commitContent, setCommitContent] = useState(
    "本人使用昵称[[会员昵称]]，编号：[[相亲会员编号]]，在[[相亲平台名称]]登记婚姻交友信息，承诺所登记资料属实，承诺当前婚恋状态为[[婚姻状态]]，本人自行承担信息不属实造成的一切后果，与平台无关。",
  );
  const [agreement, setAgreement] = useState(
    "为保障婚恋交友平台信息真实性，维护健康诚信的交友环境，本人（授权人）自愿、真实、不可撤销地授权，依法依规查询本人婚姻状态信息，用于婚恋相亲资料核实，现就授权、使用、免责事宜确认如下：\n一、授权事项与范围\n授权平台通过合法合规渠道，查询并核验本人婚姻登记状态（未婚/已婚/离异/丧偶）、登记时间、登记机关等依法可查询信息。\n授权平台仅为本人自助查询使用、展示、存储查询结果，不用于任何其他目的，不代查、不泄露、不向第三方提供。\n本人确认：本次授权为本人查询本人信息，不冒用、不伪造、不侵犯他人隐私。\n二、信息真实性与责任承诺\n本人承诺所提供身份信息真实、有效、完整。因信息不实、验证失败、冒用他人信息导致的一切法律责任与损失，由本人自行承担。\n本人知悉并同意：查询结果以婚姻登记机关官方登记数据为准，平台仅提供查询通道与结果展示服务。\n三、隐私与保密\n平台对本人信息严格保密，仅在授权范围内处理，不泄露、不出售、不非法提供给第三方（法律法规强制性要求除外）。\n本人同意平台为完成查询所需的身份信息、信息传输与临时存储，并遵守平台隐私政策。\n四、授权期限\n自本人在线确认之日起生效，至本次查询结果展示完毕止；法律法规另有规定的从其规定。\n五、免责声明\n信息来源免责。",
  );

  // 认证类型表单
  const [ctypeName, setCtypeName] = useState("");
  const [ctypeRealname, setCtypeRealname] = useState("need");
  const [ctypeDesc, setCtypeDesc] = useState("");
  const [ctypeSort, setCtypeSort] = useState("0");
  const [ctypeEnable, setCtypeEnable] = useState("on");

  const label = tabs.find((item) => item.key === tab)?.label || "实名认证";

  const currentRight = () => {
    if (tab === "commitment") {
      return (
        <button type="button" className="uath-btn primary" onClick={() => setDrawer("commit")}>
          <Settings className="size-3.5" />
          配置承诺书
        </button>
      );
    }
    if (tab === "marriage") {
      return (
        <div className="uath-filter-actions">
          <button type="button" className="uath-btn link">
            婚姻状况核验说明
          </button>
          <button type="button" className="uath-btn primary" onClick={() => setDrawer("marriage")}>
            配置《婚姻状态查询授权协议》
          </button>
        </div>
      );
    }
    if (tab === "other") {
      return (
        <button
          type="button"
          className="uath-btn primary"
          onClick={() => {
            setCtypeMode("list");
            setDrawer("ctype");
          }}
        >
          <Settings className="size-3.5" />
          管理认证类型
        </button>
      );
    }
    return null;
  };

  return (
    <div className="min-w-0">
      <AdminBreadcrumb items={[...getBreadcrumb("会员CRM", "会员认证"), { label }]} />

      <section className="uath-card">
        <div className="uath-tabs">
          {tabs.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`uath-tab ${tab === item.key ? "active" : ""}`}
              onClick={() => setTab(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* ============ 实名认证 ============ */}
        {tab === "realname" && (
          <>
            <div className="uath-notice">
              <div className="uath-notice-title">
                <span className="uath-notice-icon">!</span>
                须知
              </div>
              <p>根据《中华人民共和国网络安全法》第二十四条相关条款，网络平台（小程序/APP/网站）必须落实电子实名认证，用户不提供真实身份信息的，不得为其提供相关服务。</p>
              <p>本系统已对接腾讯云人脸核身能力，用户可直接在您的平台完成扫脸实名认证，核验基础身份信息。</p>
              <p>用户认证时根据指定动作视频上传至人脸核身服务商，系统将同步调用实名、身份证号、与公安官方权威数据实时交叉比对核验，并即时返回核验结果至我方平台。</p>
              <p>人脸核验按腾讯云服务用量计费，账户欠费会直接关停平台实名认证功能，请及时联系服务商完成充值。</p>
              <p>如需强制用户上传身份证件照片，可前往【平台配置 - 权限配置】页面并开启对应开关。</p>
            </div>

            <div className="uath-stat-row">
              {realnameStats.map((card) => (
                <div key={card.label} className="uath-stat">
                  <div className="uath-stat-top">
                    <span className="uath-stat-value">{card.value}</span>
                    {card.recharge && (
                      <button type="button" className="uath-btn primary sm">
                        在线充值
                      </button>
                    )}
                  </div>
                  <div className="uath-stat-label">{card.label}</div>
                </div>
              ))}
            </div>

            <div className="uath-filters">
              <div className="uath-status-tabs">
                {["全部", "认证成功", "认证失败"].map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={`uath-status-tab ${rnStatus === item ? "active" : ""}`}
                    onClick={() => setRnStatus(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <div className="uath-filter-right">
                <label className="uath-searchbox grow">
                  <input type="text" placeholder="请输入会员昵称/编号/姓名/身份证号" />
                </label>
                <button type="button" className="uath-btn primary">
                  <Search className="size-3.5" />
                  搜索
                </button>
                <button type="button" className="uath-btn primary" onClick={() => setDrawer("quick")}>
                  <Settings className="size-3.5" />
                  快捷设置
                </button>
              </div>
            </div>

            <div className="uath-table-wrap">
              <table className="uath-table">
                <colgroup>
                  <col style={{ width: 56 }} />
                  <col style={{ width: 230 }} />
                  <col style={{ width: 210 }} />
                  <col style={{ width: 90 }} />
                  <col style={{ width: 100 }} />
                  <col style={{ width: 130 }} />
                  <col style={{ width: 110 }} />
                  <col style={{ width: 90 }} />
                  <col style={{ width: 110 }} />
                  <col style={{ width: 160 }} />
                  <col style={{ width: 100 }} />
                </colgroup>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>会员</th>
                    <th>证件信息</th>
                    <th>证件照片</th>
                    <th>验证方式</th>
                    <th>人脸服务商</th>
                    <th>人脸比对得分</th>
                    <th>核验文件</th>
                    <th>认证结果</th>
                    <th>提交认证时间</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {realnameRows.map((row) => (
                    <tr key={row.id}>
                      <td className="uath-td-id">{row.id}</td>
                      <td>
                        <div className="uath-member">
                          <span className="uath-avatar" />
                          <div className="uath-member-info">
                            <div className="uath-member-nick">
                              {row.nick} <span className="uath-code">编号:{row.code}</span>
                            </div>
                            <div className="uath-member-name">
                              姓名：{row.name} <span className="uath-idcard">身份证：{row.idcard}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="uath-idinfo">
                          <span>性别：{row.gender}</span>
                          <span>出生：{row.birth}</span>
                          {row.issued && <span>发证：{row.issued}</span>}
                        </div>
                      </td>
                      <td>
                        <span className="uath-nofile">未上传</span>
                      </td>
                      <td>{row.method}</td>
                      <td>{row.vendor}</td>
                      <td className="uath-score">{row.score}</td>
                      <td>
                        <Thumb kind="face" />
                      </td>
                      <td>
                        <span className={`uath-badge ${row.result}`}>
                          {row.result === "success" ? "认证成功" : "认证失败"}
                        </span>
                      </td>
                      <td className="uath-time">{row.time}</td>
                      <td>
                        <button type="button" className="uath-link">
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

        {/* ============ 会员承诺 ============ */}
        {tab === "commitment" && (
          <>
            <div className="uath-notice">
              <div className="uath-notice-title">
                <span className="uath-notice-icon">!</span>
                须知
              </div>
              <p>会员通过在线签署承诺书，大大提升会员信息权威性、真实性，也是平台增加规避风险的一个有力措施和法律存证</p>
              <p>本页中记录了平台中会员所有在线签署的承诺书情况的明细；在线签署承诺书的文案内容可以进行自由配置</p>
              <p>会员签署的字迹不清晰、与实名认证的姓名不符可设置为审核不通过，用户可以重新签署</p>
            </div>

            <FilterRow
              statusTabs={["全部", "通过", "待审", "未通过"]}
              active={cmStatus}
              onStatus={setCmStatus}
              placeholder="请输入"
              right={currentRight()}
            />

            <div className="uath-table-wrap">
              <table className="uath-table">
                <colgroup>
                  <col style={{ width: 56 }} />
                  <col style={{ width: 260 }} />
                  <col style={{ width: 120 }} />
                  <col style={{ width: 100 }} />
                  <col style={{ width: 120 }} />
                  <col style={{ width: 180 }} />
                  <col style={{ width: 150 }} />
                </colgroup>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>会员</th>
                    <th>签名文件</th>
                    <th>第几次签署</th>
                    <th>签署结果</th>
                    <th>提交签署时间</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {commitRows.map((row) => (
                    <tr key={row.id}>
                      <td className="uath-td-id">{row.id}</td>
                      <td>
                        <div className="uath-member">
                          <span className="uath-avatar" />
                          <div className="uath-member-info">
                            <div className="uath-member-nick">
                              {row.nick} <span className="uath-code">编号:{row.code}</span>
                            </div>
                            <div className="uath-member-name">
                              姓名：{row.name} <span className="uath-idcard">身份证：{row.idcard}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <button type="button" className="uath-file-btn">
                          查看文件
                        </button>
                      </td>
                      <td>{row.times}</td>
                      <td>
                        {row.result === "pass" ? (
                          <span className="uath-badge plain pass">{statusMap.pass.label}</span>
                        ) : (
                          <label className="uath-inline-select">
                            <select defaultValue={row.result} className={row.result}>
                              <option value="pass">通过</option>
                              <option value="pending">待审</option>
                              <option value="fail">未通过</option>
                            </select>
                            <ChevronDown className="uath-select-caret size-3.5" />
                          </label>
                        )}
                      </td>
                      <td className="uath-time">{row.time}</td>
                      <td>
                        <div className="uath-actions">
                          <button type="button" className="uath-link">
                            查看资料
                          </button>
                          <button type="button" className="uath-link danger">
                            删除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ============ 婚姻状况 ============ */}
        {tab === "marriage" && (
          <>
            <div className="uath-notice">
              <div className="uath-notice-title">
                <span className="uath-notice-icon">!</span>
                须知
              </div>
              <p>系统对接了第三方权威数据库, 客户本人在平台上人脸核验身份信息后，即可由本人操作&ldquo;授权查询婚姻状态&rdquo;，权威数据库将返回查询结果到系统中</p>
              <p>已婚冒充单身，离异冒充未婚，这一直是困扰婚恋行业的痛点，一旦发生，则会结客户造成巨大的伤害，婚恋企业也会卷入纠纷，影响口碑</p>
              <p>根据相关法律规定，查询他人婚姻状态需通过合法途径，仅限本人、司法机关或经授权代理人操作，否则涉嫌侵犯隐私权。</p>
              <p>我们需要在合法、合规的前提下核实客户真实婚姻状态，既要做到不侵犯客户隐私权，也不能让&ldquo;有心隐瞒&rdquo;之人有空可钻。</p>
              <p><b>特别提醒：</b></p>
              <p>1、民政部门的婚姻状态信息还未实现全国联网和实时数据同步，所以任何途径查询的信息都存在滞后的可能，部分偏远地区只能以户籍地民政系统线下查询的为准。对于重点&ldquo;婚况可疑&rdquo;客户，可多种方式组合核实，或拒不配合查询的&ldquo;可疑客户&rdquo;，可拒绝服务。</p>
              <p>2、根据法律法规，婚姻状态查询结果仅查询人本人可见。被授权方记录查询结果仅限用于客户婚恋服务中的登记信息交叉核对，不得将查询结果对外展示</p>
            </div>

            <div className="uath-stat-row">
              <div className="uath-stat">
                <div className="uath-stat-top">
                  <span className="uath-stat-value">1条</span>
                  <button type="button" className="uath-btn primary sm">
                    在线充值
                  </button>
                </div>
                <div className="uath-stat-label">婚况核验查询余量</div>
              </div>
              <div className="uath-stat">
                <div className="uath-stat-top">
                  <span className="uath-stat-value">0次</span>
                </div>
                <div className="uath-stat-label">总计消耗</div>
              </div>
            </div>

            <FilterRow
              statusTabs={["全部", "已婚", "无登记信息", "离异"]}
              active={mrStatus}
              onStatus={setMrStatus}
              placeholder="请输入会员昵称/编号/姓名/身份证号"
              right={currentRight()}
            />

            <div className="uath-table-wrap">
              <table className="uath-table">
                <colgroup>
                  <col style={{ width: 70 }} />
                  <col style={{ width: 260 }} />
                  <col style={{ width: 130 }} />
                  <col style={{ width: 160 }} />
                  <col style={{ width: 130 }} />
                  <col style={{ width: 180 }} />
                  <col style={{ width: 120 }} />
                </colgroup>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>会员</th>
                    <th>核验方式</th>
                    <th>客户资料中</th>
                    <th>核验结果</th>
                    <th>核验时间</th>
                    <th>查询费用</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={7}>
                      <div className="uath-empty">
                        <Inbox className="uath-empty-icon" strokeWidth={1.2} />
                        <span>暂无数据</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ============ 房产认证 ============ */}
        {tab === "house" && (
          <>
            <div className="uath-notice">
              <div className="uath-notice-title">
                <span className="uath-notice-icon">!</span>
                须知
              </div>
              <p>本页中记录了平台中会员所提交的房产认证资料，认证资料仅在后台管理员可见，不会对会员开放。</p>
              <p>参考审核标准：房产证的产权人包含所提交会员的姓名</p>
            </div>

            <FilterRow
              statusTabs={["全部", "通过", "待审", "未通过"]}
              active={hsStatus}
              onStatus={setHsStatus}
              placeholder="请输入"
            />

            <div className="uath-table-wrap">
              <table className="uath-table">
                <colgroup>
                  <col style={{ width: 56 }} />
                  <col style={{ width: 280 }} />
                  <col style={{ width: 200 }} />
                  <col style={{ width: 140 }} />
                  <col style={{ width: 200 }} />
                  <col style={{ width: 160 }} />
                </colgroup>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>会员</th>
                    <th>文件凭证</th>
                    <th>认证结果</th>
                    <th>提交认证时间</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {houseRows.map((row) => (
                    <tr key={row.id}>
                      <td className="uath-td-id">{row.id}</td>
                      <td>
                        <div className="uath-member">
                          <span className="uath-avatar" />
                          <div className="uath-member-info">
                            <div className="uath-member-nick">
                              {row.nick} <span className="uath-code">编号:{row.code}</span>
                            </div>
                            <div className="uath-member-name">
                              姓名：{row.name} <span className="uath-idcard">身份证：{row.idcard}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <Thumb kind={row.file ? "doc" : "none"} />
                      </td>
                      <td>
                        <span className="uath-badge plain pass">{statusMap.pass.label}</span>
                      </td>
                      <td className="uath-time">{row.time}</td>
                      <td>
                        <div className="uath-actions">
                          <button type="button" className="uath-link">
                            查看资料
                          </button>
                          <button type="button" className="uath-link danger">
                            删除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ============ 学历认证 ============ */}
        {tab === "education" && (
          <>
            <div className="uath-notice">
              <div className="uath-notice-title">
                <span className="uath-notice-icon">!</span>
                须知
              </div>
              <p>本页中记录了平台中会员所提交的学历认证资料，认证资料仅在后台管理员可见，不会对会员开放。</p>
              <p>参考审核标准：登录学信网选择&ldquo;零散查询&rdquo;，输入姓名、证书编号后将收到核验结果，且证书上的姓名与会员在平台中实名一致即可判断为通过</p>
            </div>

            <FilterRow
              statusTabs={["全部", "通过", "待审", "未通过"]}
              active={edStatus}
              onStatus={setEdStatus}
              placeholder="请输入"
            />

            <div className="uath-table-wrap">
              <table className="uath-table">
                <colgroup>
                  <col style={{ width: 56 }} />
                  <col style={{ width: 270 }} />
                  <col style={{ width: 90 }} />
                  <col style={{ width: 140 }} />
                  <col style={{ width: 90 }} />
                  <col style={{ width: 120 }} />
                  <col style={{ width: 180 }} />
                  <col style={{ width: 150 }} />
                </colgroup>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>会员</th>
                    <th>学历</th>
                    <th>毕业学校</th>
                    <th>文件凭证</th>
                    <th>认证结果</th>
                    <th>提交认证时间</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {eduRows.map((row) => (
                    <tr key={row.id}>
                      <td className="uath-td-id">{row.id}</td>
                      <td>
                        <div className="uath-member">
                          <span className="uath-avatar" />
                          <div className="uath-member-info">
                            <div className="uath-member-nick">
                              {row.nick} <span className="uath-code">编号:{row.code}</span>
                            </div>
                            <div className="uath-member-name">
                              姓名：{row.name} <span className="uath-idcard">身份证：{row.idcard}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>{row.degree}</td>
                      <td>{row.school || "-"}</td>
                      <td>
                        <Thumb kind={row.file ? "doc" : "none"} />
                      </td>
                      <td>
                        <span className="uath-badge plain pass">{statusMap.pass.label}</span>
                      </td>
                      <td className="uath-time">{row.time}</td>
                      <td>
                        <div className="uath-actions">
                          <button type="button" className="uath-link">
                            查看资料
                          </button>
                          <button type="button" className="uath-link danger">
                            删除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ============ 其他认证 ============ */}
        {tab === "other" && (
          <>
            <div className="uath-notice">
              <div className="uath-notice-title">
                <span className="uath-notice-icon">!</span>
                须知
              </div>
              <p>系统中除了内置的实名认证、学历认证、房产认证之外，您可以通过&ldquo;其他认证&rdquo;系统来创建任何您所需的认证，帮助您实现通过线上高效收集到会员的更全面资料信息；并且可以通过认证的会员自动加入显示到指定的会员分区哦</p>
            </div>

            <FilterRow
              statusTabs={["全部", "通过", "待审", "未通过"]}
              active={otStatus}
              onStatus={setOtStatus}
              placeholder="请输入"
              showType
              right={currentRight()}
            />

            <div className="uath-table-wrap">
              <table className="uath-table">
                <colgroup>
                  <col style={{ width: 56 }} />
                  <col style={{ width: 140 }} />
                  <col style={{ width: 280 }} />
                  <col style={{ width: 140 }} />
                  <col style={{ width: 140 }} />
                  <col style={{ width: 200 }} />
                  <col style={{ width: 160 }} />
                </colgroup>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>认证类型</th>
                    <th>会员</th>
                    <th>文件凭证</th>
                    <th>认证结果</th>
                    <th>提交认证时间</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={7}>
                      <div className="uath-empty">
                        <Inbox className="uath-empty-icon" strokeWidth={1.2} />
                        <span>暂无数据</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      {/* ============ Drawer：快捷设置 ============ */}
      {drawer === "quick" && (
        <div className="uath-mask" onClick={() => setDrawer(null)}>
          <div className="uath-panel narrow" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="uath-panel-head">
              <div className="uath-panel-title">
                <span className="uath-panel-x" onClick={() => setDrawer(null)}>
                  <X className="size-4" />
                </span>
                <h2>快捷设置</h2>
              </div>
              <div className="uath-panel-actions">
                <button type="button" className="uath-panel-cancel" onClick={() => setDrawer(null)}>
                  取消
                </button>
                <button type="button" className="uath-panel-submit">
                  确定提交
                </button>
              </div>
            </div>
            <div className="uath-panel-body">
              <div className="uath-field">
                <div className="uath-field-label">实名时强制上传身份证</div>
                <div className="uath-field-control column">
                  <label className="uath-radio">
                    <input type="radio" name="force-id" defaultChecked />
                    <span>不强制上传</span>
                  </label>
                  <div className="uath-field-hint">
                    强制上传（在实名认证时除了人脸识别之外，还将强制要求客户必须上传身份证的照片给平台，开启本功能后可能会降低到实名认证率，注意系统并不对身份证照片进行验证）
                  </div>
                </div>
              </div>

              <div className="uath-field">
                <div className="uath-field-label">实名认证费</div>
                <div className="uath-field-control column">
                  <div className="uath-inline-unit">
                    <input type="text" className="uath-input short" defaultValue="0" />
                    <span className="uath-inline-unit-text">元/次</span>
                  </div>
                  <div className="uath-tip">
                    <span className="uath-tip-icon">i</span>
                    指客户在您平台实名认证的时候需要向您支付的费用；不建议设置收费；0元表示免费；
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============ Drawer：配置承诺书 ============ */}
      {drawer === "commit" && (
        <div className="uath-mask" onClick={() => setDrawer(null)}>
          <div className="uath-panel" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="uath-panel-head">
              <div className="uath-panel-title">
                <span className="uath-panel-x" onClick={() => setDrawer(null)}>
                  <X className="size-4" />
                </span>
                <h2>配置承诺书</h2>
              </div>
              <div className="uath-panel-actions">
                <button type="button" className="uath-panel-cancel" onClick={() => setDrawer(null)}>
                  取消
                </button>
                <button type="button" className="uath-panel-submit">
                  确定提交
                </button>
              </div>
            </div>
            <div className="uath-panel-body">
              <div className="uath-field">
                <div className="uath-field-label">
                  <span className="req">*</span>标题
                </div>
                <div className="uath-field-control">
                  <input
                    className="uath-input"
                    value={commitTitle}
                    onChange={(e) => setCommitTitle(e.target.value)}
                  />
                </div>
              </div>

              <div className="uath-field top">
                <div className="uath-field-label">
                  <span className="req">*</span>内容
                </div>
                <div className="uath-field-control column">
                  <div className="uath-textarea-wrap">
                    <textarea
                      maxLength={1000}
                      value={commitContent}
                      onChange={(e) => setCommitContent(e.target.value)}
                    />
                    <span className="uath-textarea-count">{commitContent.length} / 1000</span>
                  </div>
                  <div className="uath-tags">
                    可插入标签：[[会员昵称]] [[姓名]] [[性别]] [[身份证号]] [[相亲会员编号]] [[相亲平台名称]] [[婚姻状态]]
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============ Drawer：婚姻状态查询服务协议 ============ */}
      {drawer === "marriage" && (
        <div className="uath-mask" onClick={() => setDrawer(null)}>
          <div className="uath-panel" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="uath-panel-head">
              <div className="uath-panel-title">
                <span className="uath-panel-x" onClick={() => setDrawer(null)}>
                  <X className="size-4" />
                </span>
                <h2>婚姻状态查询服务协议</h2>
              </div>
              <div className="uath-panel-actions">
                <button type="button" className="uath-panel-cancel" onClick={() => setDrawer(null)}>
                  取消
                </button>
                <button type="button" className="uath-panel-submit">
                  确定提交
                </button>
              </div>
            </div>
            <div className="uath-panel-body">
              <div className="uath-field top">
                <div className="uath-field-label">
                  <span className="req">*</span>内容
                </div>
                <div className="uath-field-control column">
                  <textarea
                    className="uath-textarea tall"
                    value={agreement}
                    onChange={(e) => setAgreement(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============ Drawer：管理认证类型 ============ */}
      {drawer === "ctype" && (
        <div className="uath-mask" onClick={() => setDrawer(null)}>
          <div className="uath-panel" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="uath-panel-head">
              <div className="uath-panel-title">
                <span className="uath-panel-x" onClick={() => setDrawer(null)}>
                  <X className="size-4" />
                </span>
                <h2>管理认证类型</h2>
              </div>
              <div className="uath-panel-actions">
                {ctypeMode === "create" && (
                  <>
                    <button
                      type="button"
                      className="uath-panel-cancel"
                      onClick={() => setCtypeMode("list")}
                    >
                      取消
                    </button>
                    <button
                      type="button"
                      className="uath-panel-submit"
                      onClick={() => setCtypeMode("list")}
                    >
                      确定提交
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="uath-panel-body">
              {ctypeMode === "list" ? (
                <>
                  <table className="uath-table">
                    <colgroup>
                      <col style={{ width: 140 }} />
                      <col style={{ width: 90 }} />
                      <col style={{ width: 90 }} />
                      <col style={{ width: 100 }} />
                      <col style={{ width: 120 }} />
                    </colgroup>
                    <thead>
                      <tr>
                        <th>认证类型</th>
                        <th>图标</th>
                        <th>排序</th>
                        <th>状态</th>
                        <th>操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td colSpan={5}>
                          <div className="uath-empty">
                            <Inbox className="uath-empty-icon" strokeWidth={1.2} />
                            <span>暂无数据</span>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="uath-ctype-create">
                    <button type="button" className="uath-btn primary" onClick={() => setCtypeMode("create")}>
                      <Plus className="size-3.5" />
                      创建新的认证类型
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="uath-field">
                    <div className="uath-field-label">
                      <span className="req">*</span>认证类型
                    </div>
                    <div className="uath-field-control">
                      <input
                        className="uath-input short"
                        placeholder="建议4个汉字"
                        value={ctypeName}
                        onChange={(e) => setCtypeName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="uath-field top">
                    <div className="uath-field-label">实名认证</div>
                    <div className="uath-field-control column">
                      <div className="uath-radio-group">
                        <label className="uath-radio">
                          <input
                            type="radio"
                            name="ctype-realname"
                            checked={ctypeRealname === "need"}
                            onChange={() => setCtypeRealname("need")}
                          />
                          <span>需要（建议开启）</span>
                        </label>
                        <label className="uath-radio">
                          <input
                            type="radio"
                            name="ctype-realname"
                            checked={ctypeRealname === "no"}
                            onChange={() => setCtypeRealname("no")}
                          />
                          <span>不需要</span>
                        </label>
                      </div>
                      <div className="uath-tip">
                        <span className="uath-tip-icon">i</span>
                        提交本认证是否先要求并引导会员完成实名认证
                      </div>
                    </div>
                  </div>

                  <div className="uath-field top">
                    <div className="uath-field-label">
                      <span className="req">*</span>认证图标
                    </div>
                    <div className="uath-field-control column">
                      <button type="button" className="uath-upload">
                        <Plus className="size-4" />
                        上传照片
                      </button>
                      <div className="uath-tip">
                        <span className="uath-tip-icon">i</span>
                        PNG格式，尺寸100像素X100像素，为了界面美观建议设计与系统中其他认证图标风格一致
                      </div>
                    </div>
                  </div>

                  <div className="uath-field top">
                    <div className="uath-field-label">说明文案</div>
                    <div className="uath-field-control column">
                      <textarea
                        className="uath-textarea"
                        value={ctypeDesc}
                        onChange={(e) => setCtypeDesc(e.target.value)}
                      />
                      <div className="uath-tip">
                        <span className="uath-tip-icon">i</span>
                        显示在会员提交资料页面的说明文字，图示位置：
                        <span className="uath-tip-thumb" />
                      </div>
                    </div>
                  </div>

                  <div className="uath-field top">
                    <div className="uath-field-label">显示排序</div>
                    <div className="uath-field-control column">
                      <input
                        className="uath-input short"
                        value={ctypeSort}
                        onChange={(e) => setCtypeSort(e.target.value)}
                      />
                      <div className="uath-tip">
                        <span className="uath-tip-icon">i</span>
                        数字越大显示越靠前，注意：均是显示在系统内置认证项目之后
                      </div>
                    </div>
                  </div>

                  <div className="uath-field">
                    <div className="uath-field-label">是否启用</div>
                    <div className="uath-field-control">
                      <div className="uath-radio-group">
                        <label className="uath-radio">
                          <input
                            type="radio"
                            name="ctype-enable"
                            checked={ctypeEnable === "on"}
                            onChange={() => setCtypeEnable("on")}
                          />
                          <span>启用</span>
                        </label>
                        <label className="uath-radio">
                          <input
                            type="radio"
                            name="ctype-enable"
                            checked={ctypeEnable === "off"}
                            onChange={() => setCtypeEnable("off")}
                          />
                          <span>关闭</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
