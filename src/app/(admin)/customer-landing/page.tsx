"use client";
import { useState } from "react";
import { X, Type, Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, List, ListOrdered, Link2, Image as ImageIcon, Smile, Quote, Code, Heading1, Heading2, RotateCcw, RotateCw, Trash2, Maximize2, Plus, Minus } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";

const breadcrumb = [
  { label: "首页", href: "/" },
  { label: "运营工具", href: "/free-pay" },
  { label: "超级获客", href: "/customer-landing" },
  { label: "落地页" },
];

const rows = [
  { id: 1, title: "你好6月", form: "单页·内置表单", position: "会员资料", time: "2026-06-12 14:42:38", views: 4, source: "总数：0 男：0 女：0", matchmaker: "-" },
];

export default function CustomerLandingPage() {
  const [checked, setChecked] = useState<number[]>([]);
  const [selected, setSelected] = useState<number[]>([]);

  const toggleAll = () => {
    setChecked((cur) => (cur.length === rows.length ? [] : rows.map((r) => r.id)));
  };

  const toggleRow = (id: number) => {
    setChecked((cur) => (cur.includes(id) ? cur.filter((v) => v !== id) : [...cur, id]));
    setSelected((cur) => (cur.includes(id) ? cur.filter((v) => v !== id) : [...cur, id]));
  };

  const allChecked = rows.length > 0 && checked.length === rows.length;
  const [addOpen, setAddOpen] = useState(false);
  const [formType, setFormType] = useState("内置表单");
  const [pageType, setPageType] = useState("单页");
  const [fields, setFields] = useState<string[]>(["昵称", "性别"]);
  const [dataPos, setDataPos] = useState("保存到客源线索");
  const [phoneVer, setPhoneVer] = useState("需验证");
  const [assignMode, setAssignMode] = useState("待分派");

  const toggleField = (f: string) =>
    setFields((cur) => (cur.includes(f) ? cur.filter((x) => x !== f) : [...cur, f]));

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      {/* 蓝色信息条 */}
      <div className="ecl-notice">
        <div className="ecl-notice-body">
          <span className="ecl-notice-ic">◇</span>
          <div className="ecl-notice-text">
            <div className="ecl-notice-title">须知</div>
            <p>获客落地页能够灵活用于各个运营场景中用于快捷完成"用户资料填写"之用途，也可以用于在第三方平台投放使用，并能统计浏览量和获客数据。</p>
            <p>通过获客落地页获取的资料可显示在"客源线索-线索管理"或"会员CRM-资料管理"中，并会在来源中标注来自"落地页"。用户通过落地页登记资料免费审核通过。</p>
            <p>内置表单模式下，只要手机号已经存在库中，均无法再次提交。<a className="cl-inline-link" href="#">效果预览</a></p>
            <p>自由表单模式下，同一个表单项目，同一手机号只允许提交一次，不判断是否是平台会员，可在多个项目之间重复提交。</p>
          </div>
        </div>
      </div>

      <div className="finord-card">
        {/* 标题行 */}
        <div className="cl-head">
          <div className="cl-title">获客落地页</div>
          <button className="finord-btn finord-btn-primary" onClick={() => setAddOpen(true)}>＋ 创建落地页</button>
        </div>

        {/* 筛选条 */}
        <div className="finord-filters cl-filters">
          <input className="finord-search-input cl-search" placeholder="请输入关键字" />
          <button className="finord-btn finord-btn-primary">搜索</button>
        </div>

        {/* 表格 */}
        <div className="finord-table-wrap">
          <table className="finord-table cl-table">
            <thead>
              <tr>
                <th className="cl-col-check"><input type="checkbox" className="cl-check" checked={allChecked} onChange={toggleAll} /></th>
                <th>ID</th>
                <th>落地页标题</th>
                <th>形式</th>
                <th>数据位置</th>
                <th>创建时间</th>
                <th>浏览量</th>
                <th>获取客源</th>
                <th>推广红娘</th>
                <th>链接/二维码</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="cl-col-check"><input type="checkbox" className="cl-check" checked={checked.includes(row.id) || selected.includes(row.id)} onChange={() => toggleRow(row.id)} /></td>
                  <td>{row.id}</td>
                  <td>{row.title}</td>
                  <td>{row.form}</td>
                  <td><span className="cl-badge">{row.position}</span></td>
                  <td>{row.time}</td>
                  <td>{row.views}</td>
                  <td>{row.source}</td>
                  <td>{row.matchmaker}</td>
                  <td><a className="finord-link" href="#">查看</a></td>
                  <td>
                    <div className="cl-ops">
                      <a className="finord-link" href="#">预览</a>
                      <a className="finord-link" href="#">复制</a>
                      <a className="finord-link" href="#">编辑</a>
                      <a className="finord-link cl-op-del" href="#">删除</a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 分页 */}
        <div className="finord-pagination">
          <div className="cl-pages">
            <button className="finord-page nav">‹</button>
            <button className="finord-page active">1</button>
            <button className="finord-page nav">›</button>
          </div>
          <div className="finord-page-size">20 条/页 <span className="finord-page-size-arrow">▾</span></div>
        </div>
      </div>

      {addOpen && (
        <AddLandingDrawer
          onClose={() => setAddOpen(false)}
          formType={formType} setFormType={setFormType}
          pageType={pageType} setPageType={setPageType}
          fields={fields} toggleField={toggleField}
          dataPos={dataPos} setDataPos={setDataPos}
          phoneVer={phoneVer} setPhoneVer={setPhoneVer}
          assignMode={assignMode} setAssignMode={setAssignMode}
        />
      )}
    </div>
  );
}

const CLL_TOOLBAR: { icon: React.ReactNode; title: string }[] = [
  { icon: <Heading1 size={14} />, title: "标题" },
  { icon: <Type size={14} />, title: "正文" },
  { icon: <Bold size={14} />, title: "加粗" },
  { icon: <Italic size={14} />, title: "斜体" },
  { icon: <Underline size={14} />, title: "下划线" },
  { icon: <Strikethrough size={14} />, title: "删除线" },
  { icon: <AlignLeft size={14} />, title: "左对齐" },
  { icon: <AlignCenter size={14} />, title: "居中" },
  { icon: <AlignRight size={14} />, title: "右对齐" },
  { icon: <List size={14} />, title: "无序列表" },
  { icon: <ListOrdered size={14} />, title: "有序列表" },
  { icon: <Link2 size={14} />, title: "链接" },
  { icon: <ImageIcon size={14} />, title: "图片" },
  { icon: <Smile size={14} />, title: "表情" },
  { icon: <Quote size={14} />, title: "引用" },
  { icon: <Code size={14} />, title: "代码" },
  { icon: <Plus size={14} />, title: "更多" },
  { icon: <RotateCcw size={14} />, title: "撤销" },
  { icon: <RotateCw size={14} />, title: "重做" },
  { icon: <Minus size={14} />, title: "分割线" },
  { icon: <Maximize2 size={14} />, title: "全屏" },
  { icon: <Trash2 size={14} />, title: "清空" },
];

const FIELD_OPTIONS = ["昵称", "性别", "头像", "出生", "职业", "婚况", "学历", "身高", "体重", "收入", "现居", "籍贯", "民族", "手机", "微信"];
const REQUIRED_FIELDS = ["昵称", "性别", "手机"];

function AddLandingDrawer(props: {
  onClose: () => void;
  formType: string; setFormType: (v: string) => void;
  pageType: string; setPageType: (v: string) => void;
  fields: string[]; toggleField: (f: string) => void;
  dataPos: string; setDataPos: (v: string) => void;
  phoneVer: string; setPhoneVer: (v: string) => void;
  assignMode: string; setAssignMode: (v: string) => void;
}) {
  return (
    <>
      <div className="tlc-mask" onClick={props.onClose} />
      <div className="tlc-panel cll-panel">
        <div className="tlc-panel-head">
          <div className="tlc-panel-head-left">
            <button className="tlc-x" onClick={props.onClose} aria-label="关闭"><X size={18} /></button>
            <span className="tlc-panel-title">创建获客落地页</span>
          </div>
          <div className="cll-head-actions">
            <button className="finord-btn cll-cancel" onClick={props.onClose}>取消</button>
            <button className="finord-btn finord-btn-primary">确定提交</button>
          </div>
        </div>
        <div className="tlc-panel-body">
          {/* 标题 */}
          <div className="cll-row">
            <span className="cll-label">＊标题</span>
            <input className="cll-input cll-input-wide" placeholder="最多30汉字" />
          </div>

          {/* 表单形式 */}
          <div className="cll-row">
            <span className="cll-label">表单形式</span>
            <div className="cll-options cll-options-row">
              {["内置表单", "自由表单"].map((o) => (
                <label key={o} className={`cll-radio ${props.formType === o ? "active" : ""}`}>
                  <input type="radio" name="formType" value={o} checked={props.formType === o} onChange={() => props.setFormType(o)} />
                  <span>{o}</span>
                </label>
              ))}
              {props.formType === "自由表单" && <a className="cll-link">效果预览</a>}
            </div>
          </div>

          {/* 页面形式 */}
          <div className="cll-row">
            <span className="cll-label">页面形式</span>
            <div className="cll-options cll-options-row">
              {["单页", "引导页"].map((o) => (
                <label key={o} className={`cll-radio ${props.pageType === o ? "active" : ""}`}>
                  <input type="radio" name="pageType" value={o} checked={props.pageType === o} onChange={() => props.setPageType(o)} />
                  <span>{o}</span>
                </label>
              ))}
              <a className="cll-link">预览</a>
            </div>
          </div>

          {/* 字段 */}
          <div className="cll-row cll-row-top">
            <span className="cll-label">字段</span>
            <div className="cll-fields">
              {FIELD_OPTIONS.map((f) => (
                <label key={f} className="cll-check">
                  <input
                    type="checkbox"
                    checked={props.fields.includes(f)}
                    onChange={() => !REQUIRED_FIELDS.includes(f) && props.toggleField(f)}
                    disabled={REQUIRED_FIELDS.includes(f)}
                  />
                  <span>{f}{REQUIRED_FIELDS.includes(f) && <em className="cll-req">(必填)</em>}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 表单抬头 */}
          <div className="cll-row">
            <span className="cll-label">＊表单抬头</span>
            <input className="cll-input cll-input-wide" placeholder="最多30汉字" />
          </div>

          {/* 头部图片 */}
          <div className="cll-row cll-row-top">
            <span className="cll-label">头部图片</span>
            <div className="cll-content">
              <div className="cll-pick"><Plus size={18} /><span>上传图片</span></div>
              <div className="cll-info">推荐尺寸750*400，若不上传则默认为模板中的图片</div>
            </div>
          </div>

          {/* 头部自定义 */}
          <div className="cll-row cll-row-top">
            <span className="cll-label">头部自定义</span>
            <div className="cll-content">
              <div className="cll-editor">
                <div className="cll-editor-toolbar">
                  {CLL_TOOLBAR.map((it, idx) => (
                    <button key={idx} type="button" className="cll-editor-tool" title={it.title}>{it.icon}</button>
                  ))}
                </div>
                <div className="cll-editor-body" contentEditable suppressContentEditableWarning>
                  <p className="cll-editor-placeholder">请输入正文</p>
                </div>
              </div>
            </div>
          </div>

          {/* 分享图标 */}
          <div className="cll-row cll-row-top">
            <span className="cll-label">分享图标</span>
            <div className="cll-content">
              <div className="cll-pick"><Plus size={18} /><span>上传图片</span></div>
              <div className="cll-info">推荐尺寸300*300，在线裁剪</div>
            </div>
          </div>

          {/* 分享描述 */}
          <div className="cll-row">
            <span className="cll-label">分享描述</span>
            <input className="cll-input cll-input-wide" placeholder="请输入描述" />
          </div>

          {/* 数据位置 */}
          <div className="cll-row cll-row-top">
            <span className="cll-label">数据位置</span>
            <div className="cll-content">
              <div className="cll-options cll-options-row">
                {["保存到客源线索", "保存到会员资料（并自动注册用户账号）"].map((o) => (
                  <label key={o} className={`cll-radio ${props.dataPos === o ? "active" : ""}`}>
                    <input type="radio" name="dataPos" value={o} checked={props.dataPos === o} onChange={() => props.setDataPos(o)} />
                    <span>{o}</span>
                  </label>
                ))}
              </div>
              <div className="cll-info">此处设置后不可修改</div>
            </div>
          </div>

          {/* 手机号码 */}
          <div className="cll-row">
            <span className="cll-label">手机号码</span>
            <div className="cll-options cll-options-row">
              {["无需验证（手机号直接填写无需验证）", "需验证（手机号码需要进行验证码验真息才可以提交）"].map((o) => (
                <label key={o} className={`cll-radio ${props.phoneVer === o ? "active" : ""}`}>
                  <input type="radio" name="phoneVer" value={o} checked={props.phoneVer === o} onChange={() => props.setPhoneVer(o)} />
                  <span>{o}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 默认分派 */}
          <div className="cll-row cll-row-top">
            <span className="cll-label">默认分派</span>
            <div className="cll-content">
              <div className="cll-options cll-options-row">
                {["待分派", "分派给指定红娘"].map((o) => (
                  <label key={o} className={`cll-radio ${props.assignMode === o ? "active" : ""}`}>
                    <input type="radio" name="assignMode" value={o} checked={props.assignMode === o} onChange={() => props.setAssignMode(o)} />
                    <span>{o}</span>
                  </label>
                ))}
              </div>
              <div className="cll-info">可以选择多个红娘，系统会自动将本落地页获取来的客源随机循环分派给这些指定的红娘</div>
            </div>
          </div>

          {/* 推广红娘 */}
          <div className="cll-row cll-row-top">
            <span className="cll-label">推广红娘</span>
            <div className="cll-content">
              <input className="cll-input" placeholder="请输入用户账号" style={{ width: 240 }} />
              <div className="cll-info">设置推广红娘后，通过该落地页获取的客源均将特定到该推广红娘名下</div>
            </div>
          </div>

          {/* 页面跳转 */}
          <div className="cll-row cll-row-top">
            <span className="cll-label">页面跳转</span>
            <div className="cll-content">
              <input className="cll-input cll-input-wide" placeholder="请输入https://" />
              <div className="cll-info">页面跳转是指客户在落地页成功提交资料后进入的页面，留空则跳转至平台首页；自由表单模式下，若留空的话则在提交后默认返回到平台首页</div>
            </div>
          </div>

          {/* 按钮文案 */}
          <div className="cll-row">
            <span className="cll-label">按钮文案</span>
            <input className="cll-input cll-input-wide" defaultValue="立即加入" />
          </div>

          {/* 提交按钮背景色 */}
          <div className="cll-row">
            <span className="cll-label">提交按钮背景色</span>
            <div className="cll-color-row">
              <div className="cll-color-swatch" style={{ background: "#6b5dd3" }} />
              <a className="cll-link">恢复默认</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
