"use client";
import { useState } from "react";
import { X } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";

const breadcrumb = [
  { label: "首页", href: "/" },
  { label: "运营工具", href: "/free-pay" },
  { label: "批量资料卡" },
];

type ChipGroupDef = {
  id: string;
  label: string;
  options: string[];
  defaultSelected: string[];
  wrapTop?: boolean;
};

const chipGroups: ChipGroupDef[] = [
  { id: "marriage", label: "婚姻状态", options: ["未婚", "离异未育", "离异不带孩", "离异带女孩", "离异带男孩", "丧偶"], defaultSelected: [] },
  { id: "edu", label: "学历", options: ["不限", "初中", "技校", "高中", "大专", "本科", "硕士", "博士"], defaultSelected: ["不限"] },
  { id: "income", label: "收入", options: ["不限", "3千元以下", "3-5千元", "5-8千元", "8千-1万元", "1-2万元", "2万元以上", "5万元以上", "年入百万"], defaultSelected: ["不限"] },
  { id: "job", label: "工作", options: ["不限", "私企员工", "央企", "国企", "外企", "事业单位", "公务员", "教师", "医生", "护士", "互联网行业", "自由职业", "军人", "工人", "服务业", "金融", "律师", "求职中", "在校学生", "个体老板", "公司高管", "美容师", "健身教练"], defaultSelected: ["不限"] },
  { id: "tag", label: "会员标签", options: ["高颜值", "高收入", "985毕业", "211毕业", "事业单位", "双一流", "海归", "身材好", "博士", "国企", "银行金融", "公务员"], defaultSelected: ["高颜值"] },
];

const STATUS_OPTS = ["不限", "公开相亲", "委托红娘", "完全私密", "已经脱单"];
const GENDER_OPTS = ["不限", "男", "女"];
const RANGE_OPTS = ["不限", "指定区域"];
const REALNAME_OPTS = ["不限", "未实名认证", "已实名认证"];
const EDUAUTH_OPTS = ["不限", "已学历认证"];
const HOUSEAUTH_OPTS = ["不限", "已房产认证"];
const ONLINE_VIP_OPTS = ["不限", "普通会员", "新人专享", "心动专享", "挚爱专享"];
const OFFLINE_VIP_OPTS = ["不限", "是", "否"];
const RANK_OPTS = ["按相亲会员ID从小到大排序"];
const BATCH_OPTS = ["第1-50条", "第51-100条", "第101-150条", "第151-200条", "第201-250条", "第251-300条", "第301-350条", "第351-400条", "第401-450条", "第451-500条", "第501-546条", "仅生成最新前50"];
const QR_OPTS = ["普通H5二维码", "公众号临时二维码", "公众号永久有效二维码", "指定二维码"];
const HEAD_OPTS = ["会员头像", "自定义通用头像"];

const TPL_COLORS = [
  ["#f6d8e2", "#e8b6c6"], ["#dfe6fb", "#c1d0f2"], ["#e4f0e3", "#c6e0c4"],
  ["#fdf0d5", "#f6dfa8"], ["#e6dcf5", "#cfbce8"], ["#fde3dc", "#f8c4b8"],
  ["#dcf3f3", "#b6e3e3"], ["#f3e6d8", "#e7d0b4"], ["#e9e1f7", "#d3c4ef"],
  ["#f7e0ec", "#ecc1d8"], ["#dbeefb", "#c0e0f5"], ["#eaf3dd", "#d2e8c0"],
  ["#fde9d9", "#f8d4b8"], ["#f0dff0", "#e0c4e0"], ["#e2f0e8", "#c6e0d0"],
  ["#f5e3de", "#ebc8c0"], ["#e0e6f5", "#c4cfec"], ["#f8ecd8", "#f0d8b4"],
  ["#e4e0f5", "#ccc4ec"], ["#fdf3e0", "#f7e0b8"], ["#e6eef7", "#c8d9ee"],
  ["#f6f0dd", "#ecdfb6"], ["#e4f0f0", "#c2e2e2"], ["#f7e8e4", "#efc8c0"],
];

const makeTemplates = (count: number, prefix: string) =>
  Array.from({ length: count }, (_, i) => ({
    id: `${prefix}-${i}`,
    c1: TPL_COLORS[i % TPL_COLORS.length][0],
    c2: TPL_COLORS[i % TPL_COLORS.length][1],
    name: `模板${prefix}${i + 1}`,
  }));

const NORMAL_TPLS = makeTemplates(24, "N");
const A4_TPLS = makeTemplates(16, "A");

function RadioGroup({ label, options, value, onChange, name, layout = "inline" }: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  name: string;
  layout?: "inline" | "chips";
}) {
  return (
    <div className="tlc-row">
      <label className="tlc-label">{label}</label>
      <div className={`tlc-options ${layout === "chips" ? "tlc-options-chips" : ""}`}>
        {options.map((o) => (
          <label key={o} className={`tlc-radio ${value === o ? "active" : ""}`}>
            <input type="radio" name={name} value={o} checked={value === o} onChange={() => onChange(o)} />
            <span>{o}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function ChipGroup({ def, selected, onToggle, onToggleAll }: {
  def: ChipGroupDef;
  selected: string[];
  onToggle: (o: string) => void;
  onToggleAll: () => void;
}) {
  const all = selected.length === def.options.length;
  return (
    <div className="tlc-row tlc-row-top">
      <label className="tlc-label">{def.label}</label>
      <div className="tlc-chips">
        <button type="button" className={`tlc-chip ${all ? "active" : ""}`} onClick={onToggleAll}>全选</button>
        {def.options.map((o) => (
          <button
            key={o}
            type="button"
            className={`tlc-chip ${selected.includes(o) ? "active" : ""}`}
            onClick={() => onToggle(o)}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

function TplCard({ tpl, active, onSelect }: { tpl: { id: string; c1: string; c2: string; name: string }; active: boolean; onSelect: () => void }) {
  return (
    <button type="button" className={`tlc-tpl ${active ? "active" : ""}`} onClick={onSelect}>
      <span className="tlc-tpl-inner" style={{ background: `linear-gradient(160deg, ${tpl.c1} 0%, ${tpl.c2} 100%)` }}>
        <span className="tpl-check" />
        <span className="tlc-tpl-avatar" />
        <span className="tlc-tpl-line w60" />
        <span className="tlc-tpl-line w40" />
        <span className="tlc-tpl-line w50" />
        <span className="tlc-tpl-qr" />
      </span>
    </button>
  );
}

export default function ToolLovecardPage() {
  const [drawer, setDrawer] = useState(false);
  const [overview, setOverview] = useState(false);
  const [drawerTab, setDrawerTab] = useState("自定义条件");

  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("不限");
  const [regStart, setRegStart] = useState("");
  const [regEnd, setRegEnd] = useState("");
  const [gender, setGender] = useState("不限");
  const [cityMode, setCityMode] = useState("不限");
  const [nativeMode, setNativeMode] = useState("不限");
  const [realname, setRealname] = useState("不限");
  const [eduauth, setEduauth] = useState("不限");
  const [houseauth, setHouseauth] = useState("不限");
  const [onlineVip, setOnlineVip] = useState("不限");
  const [offlineVip, setOfflineVip] = useState("不限");
  const [heightMin, setHeightMin] = useState("140");
  const [heightMax, setHeightMax] = useState("200");
  const [ageMin, setAgeMin] = useState("18");
  const [ageMax, setAgeMax] = useState("80");
  const [matchmaker, setMatchmaker] = useState("");
  const [tplTab, setTplTab] = useState("常规模板");
  const [selectedTpl, setSelectedTpl] = useState("N-0");
  const [headMode, setHeadMode] = useState("会员头像");
  const [qrcode, setQrcode] = useState("普通H5二维码");
  const [desc, setDesc] = useState("微信扫码识别\n了解Ta更多资料");
  const [rank, setRank] = useState("按相亲会员ID从小到大排序");
  const [batch, setBatch] = useState("第1-50条");
  const [activity, setActivity] = useState("");

  const [chipState, setChipState] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(chipGroups.map((g) => [g.id, g.defaultSelected]))
  );

  const chipVisible = (id: string) =>
    chipGroups.find((g) => g.id === id)?.options ?? [];

  const toggleChip = (id: string, o: string) => {
    setChipState((cur) => {
      const list = cur[id] ?? [];
      return {
        ...cur,
        [id]: list.includes(o) ? list.filter((v) => v !== o) : [...list, o],
      };
    });
  };

  const toggleChipAll = (id: string) => {
    setChipState((cur) => {
      const list = cur[id] ?? [];
      const all = chipVisible(id);
      return { ...cur, [id]: list.length === all.length ? [] : [...all] };
    });
  };

  const tplList = tplTab === "常规模板" ? NORMAL_TPLS : A4_TPLS;

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      {/* 蓝色信息条 */}
      <div className="ecl-notice">
        <div className="ecl-notice-body">
          <span className="ecl-notice-ic">◇</span>
          <div className="ecl-notice-text">
            <div className="ecl-notice-title">须知</div>
            <p>本应用可以从相亲会员资料中按照指定的条件快速筛选出数据批量导出相亲海报供下载到本地。</p>
            <p>批量导出的相亲海报可以用来快速制作相亲信息推文、朋友圈、印刷制作纸质会员资料册、线下活动相亲会员展示墙等各种用途，极大的提高效率和发挥。</p>
            <p>他人通过扫码海报上的二维码可引导您的公众号并自动进入相亲平台查看到会员的资料详细信息，既能涨粉又能快速直接引导会员到平台。</p>
            <p>海报批量生成后是保存在您的服务器上，并生成有对应的管理记录，方便您随时查看和下载。</p>
            <p>批量生成的相亲海报的名称以会员编号命名，如：5208001.png</p>
          </div>
        </div>
      </div>

      <div className="finord-card">
        {/* 标题行 */}
        <div className="tlc-head">
          <div className="tlc-title">批量资料卡</div>
          <div className="tlc-actions">
            <button className="finord-btn finord-btn-primary" onClick={() => setDrawer(true)}>＋ 新建批量生成</button>
            <button className="finord-btn finord-btn-primary" onClick={() => setOverview(true)}>🎨 模板样式总览</button>
          </div>
        </div>

        {/* 表格 */}
        <div className="finord-table-wrap">
          <table className="finord-table tlc-table">
            <thead>
              <tr>
                <th>创建时间</th>
                <th>项目标题</th>
                <th>二维码类型</th>
                <th>二维码有效期</th>
                <th>模板</th>
                <th>数量</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={7} className="ecl-empty">
                  <div className="ecl-empty-inner">
                    <div className="ecl-empty-icon">▤</div>
                    <div className="ecl-empty-text">暂无数据</div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 新建批量生成 Drawer */}
      {drawer && (
        <>
          <div className="tlc-mask" onClick={() => setDrawer(false)} />
          <div className="tlc-panel">
            <div className="tlc-panel-head">
              <div className="tlc-panel-head-left">
                <button className="tlc-x" onClick={() => setDrawer(false)}><X size={18} /></button>
                <span className="tlc-panel-title">新建批量生成</span>
              </div>
              <button className="finord-btn finord-btn-primary tlc-upload-btn">☁ 拥抱此上传</button>
            </div>

            <div className="tlc-panel-body">
              {/* tab */}
              <div className="tlc-tabs">
                <button className={`tlc-tab ${drawerTab === "自定义条件" ? "active" : ""}`} onClick={() => setDrawerTab("自定义条件")}>自定义条件</button>
                <button className={`tlc-tab ${drawerTab === "按活动报名" ? "active" : ""}`} onClick={() => setDrawerTab("按活动报名")}>按活动报名</button>
              </div>

              {drawerTab === "自定义条件" ? (
                <>
                  {/* 结果条件条 */}
                  <div className="tlc-condition">
                    <span className="tlc-condition-star">★</span> 结果为年龄在18-80岁、身高在140-200厘米之间且相亲会员资料审核通过的相亲会员
                  </div>

                  {/* 项目标题 */}
                  <div className="tlc-row">
                    <label className="tlc-label tlc-required">项目标题</label>
                    <div className="tlc-content">
                      <input className="tlc-input" value={title} onChange={(e) => setTitle(e.target.value)} />
                      <div className="tlc-info">● 自定义文字，方便管理识别，如：30岁以上未婚女生</div>
                    </div>
                  </div>

                  <RadioGroup label="相亲状态" name="status" options={STATUS_OPTS} value={status} onChange={setStatus} />

                  {/* 注册时间 */}
                  <div className="tlc-row">
                    <label className="tlc-label">注册时间</label>
                    <div className="tlc-content tlc-inline">
                      <input className="tlc-date" type="date" value={regStart} onChange={(e) => setRegStart(e.target.value)} />
                      <span className="tlc-arrow">→</span>
                      <input className="tlc-date" type="date" value={regEnd} onChange={(e) => setRegEnd(e.target.value)} />
                    </div>
                  </div>

                  <RadioGroup label="会员性别" name="gender" options={GENDER_OPTS} value={gender} onChange={setGender} />

                  <RadioGroup label="现居地" name="city" options={RANGE_OPTS} value={cityMode} onChange={setCityMode} layout="chips" />
                  <div className="tlc-info tlc-info-full">● 添加后生效，可添加多个区域</div>

                  <RadioGroup label="籍贯" name="native" options={RANGE_OPTS} value={nativeMode} onChange={setNativeMode} layout="chips" />
                  <div className="tlc-info tlc-info-full">● 添加后生效，可添加多个区域</div>

                  <RadioGroup label="实名认证" name="realname" options={REALNAME_OPTS} value={realname} onChange={setRealname} />
                  <RadioGroup label="学历认证" name="eduauth" options={EDUAUTH_OPTS} value={eduauth} onChange={setEduauth} />
                  <RadioGroup label="房产认证" name="houseauth" options={HOUSEAUTH_OPTS} value={houseauth} onChange={setHouseauth} />
                  <RadioGroup label="线上VIP" name="onlineVip" options={ONLINE_VIP_OPTS} value={onlineVip} onChange={setOnlineVip} />
                  <RadioGroup label="线下VIP" name="offlineVip" options={OFFLINE_VIP_OPTS} value={offlineVip} onChange={setOfflineVip} />

                  {/* 身高范围 */}
                  <div className="tlc-row">
                    <label className="tlc-label">身高范围</label>
                    <div className="tlc-content tlc-inline">
                      <input className="tlc-num" value={heightMin} onChange={(e) => setHeightMin(e.target.value)} />
                      <span className="tlc-unit">CM</span>
                      <span className="tlc-arrow">至</span>
                      <input className="tlc-num" value={heightMax} onChange={(e) => setHeightMax(e.target.value)} />
                      <span className="tlc-unit">CM</span>
                    </div>
                    <div className="tlc-sel-info">● 将从您选择的范围中随机选择</div>
                  </div>

                  {/* 年龄范围 */}
                  <div className="tlc-row">
                    <label className="tlc-label">年龄范围</label>
                    <div className="tlc-content tlc-inline">
                      <input className="tlc-num" value={ageMin} onChange={(e) => setAgeMin(e.target.value)} />
                      <span className="tlc-unit">岁</span>
                      <span className="tlc-arrow">至</span>
                      <input className="tlc-num" value={ageMax} onChange={(e) => setAgeMax(e.target.value)} />
                      <span className="tlc-unit">岁</span>
                    </div>
                    <div className="tlc-sel-info">● 将从您选择的范围中随机选择</div>
                  </div>

                  {chipGroups.map((g) => (
                    <ChipGroup key={g.id} def={g} selected={chipState[g.id] ?? []} onToggle={(o) => toggleChip(g.id, o)} onToggleAll={() => toggleChipAll(g.id)} />
                  ))}

                  {/* 服务红娘 */}
                  <div className="tlc-row tlc-row-top">
                    <label className="tlc-label">服务红娘</label>
                    <div className="tlc-chips">
                      <button type="button" className={`tlc-chip ${matchmaker === "全选" ? "active" : ""}`} onClick={() => setMatchmaker("全选")}>全选</button>
                      <button type="button" className={`tlc-chip ${matchmaker === "芸希老师" ? "active" : ""}`} onClick={() => setMatchmaker("芸希老师")}>芸希老师</button>
                    </div>
                  </div>

                  <div className="tlc-info tlc-info-full">● 当前符合上述条件的会员共有 346 人</div>

                  {/* 海报模板 */}
                  <div className="tlc-row tlc-row-top">
                    <label className="tlc-label">海报模板</label>
                    <div className="tlc-tpl-tabs">
                      <button className={`tlc-tpl-tab ${tplTab === "常规模板" ? "active" : ""}`} onClick={() => setTplTab("常规模板")}>常规模板</button>
                      <button className={`tlc-tpl-tab ${tplTab === "4A打印专用" ? "active" : ""}`} onClick={() => setTplTab("4A打印专用")}>4A打印专用</button>
                    </div>
                  </div>

                  {/* 模板网格 */}
                  <div className="tlc-tpl-grid">
                    {tplList.map((t) => (
                      <TplCard key={t.id} tpl={t} active={selectedTpl === t.id} onSelect={() => setSelectedTpl(t.id)} />
                    ))}
                  </div>

                  <RadioGroup label="海报头像" name="head" options={HEAD_OPTS} value={headMode} onChange={setHeadMode} />

                  <RadioGroup label="二维码类型" name="qrcode" options={QR_OPTS} value={qrcode} onChange={setQrcode} />
                  <div className="tlc-info tlc-info-full">● 扫码后直接到资料内容页</div>

                  {/* 二维码描述文章 */}
                  <div className="tlc-row">
                    <label className="tlc-label">二维码描述文章</label>
                    <div className="tlc-content">
                      <textarea className="tlc-textarea" rows={2} value={desc} onChange={(e) => setDesc(e.target.value)} />
                    </div>
                  </div>

                  {/* 生成数量 */}
                  <div className="tlc-row tlc-row-top">
                    <label className="tlc-label">生成数量</label>
                    <div className="tlc-content">
                      <div className="tlc-rank">
                        <label className={`tlc-radio ${rank === "按相亲会员ID从小到大排序" ? "active" : ""}`}>
                          <input type="radio" name="rank" checked={rank === "按相亲会员ID从小到大排序"} onChange={() => setRank("按相亲会员ID从小到大排序")} />
                          <span>按相亲会员ID从小到大排序</span>
                        </label>
                      </div>
                      <div className="tlc-batches">
                        {BATCH_OPTS.map((b) => (
                          <label key={b} className={`tlc-radio tlc-batch ${batch === b ? "active" : ""}`}>
                            <input type="radio" name="batch" value={b} checked={batch === b} onChange={() => setBatch(b)} />
                            <span>{b}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="tlc-panel-footer">
                    <button className="finord-btn finord-btn-primary" onClick={() => setDrawer(false)}>确定提交</button>
                    <button className="finord-btn tlc-btn-muted">直接下载</button>
                  </div>
                </>
              ) : (
                <>
                  <div className="tlc-condition">
                    <span className="tlc-condition-star">★</span> 选择已结束或已报名的活动，批量生成参与该活动的会员资料海报
                  </div>
                  <div className="tlc-row">
                    <label className="tlc-label tlc-required">选择活动</label>
                    <div className="tlc-content">
                      <select className="tlc-input" value={activity} onChange={(e) => setActivity(e.target.value)}>
                        <option value="">请选择活动</option>
                        <option>往期活动回顾</option>
                        <option>成功案例故事</option>
                      </select>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* 模板样式总览 */}
      {overview && (
        <div className="tlc-overview-mask">
          <button className="tlc-overview-close" onClick={() => setOverview(false)}><X size={20} /></button>
          <div className="tlc-overview">
            <div className="tlc-ov-title">会员资料海报批量制作</div>
            <div className="tlc-ov-sub">线下相亲墙 / 纸质资料册 / 发朋友圈 / 资料相册</div>
            <div className="tlc-ov-grid">
              {[...NORMAL_TPLS, ...A4_TPLS].map((t) => (
                <div key={t.id} className="tlc-ov-card" style={{ background: `linear-gradient(160deg, ${t.c1} 0%, ${t.c2} 100%)` }}>
                  <span className="tlc-ov-avatar" />
                  <span className="tlc-ov-line w60" />
                  <span className="tlc-ov-line w40" />
                  <span className="tlc-ov-line w50" />
                  <span className="tlc-ov-qr" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
