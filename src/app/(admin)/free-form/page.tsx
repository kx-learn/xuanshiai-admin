"use client";
import { useState } from "react";
import { X } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";

const breadcrumb = [
  { label: "首页", href: "/" },
  { label: "运营工具", href: "/free-pay" },
  { label: "超级获客", href: "/customer-landing" },
  { label: "自由表单" },
];

export default function FreeFormPage() {
  const [fieldOpen, setFieldOpen] = useState(false);

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      {/* 蓝色信息条 */}
      <div className="ecl-notice">
        <div className="ecl-notice-body">
          <span className="ecl-notice-ic">◇</span>
          <div className="ecl-notice-text">
            <div className="ecl-notice-title">须知</div>
            <p>这里您可以查看到所有通过"自由表单"填写登记的客户信息资料，并可以将他们批量导出到表格、入库到系统的客源线索、或会员CRM中。</p>
          </div>
        </div>
      </div>

      <div className="finord-card">
        {/* 标题行 */}
        <div className="ff-head">
          <div className="ff-title">自由表单</div>
          <div className="ff-actions">
            <button className="finord-btn finord-btn-primary">⬆ 导出EXCEL</button>
            <button className="finord-btn finord-btn-primary" onClick={() => setFieldOpen(true)}>▦ 字段管理</button>
          </div>
        </div>

        {/* 筛选条 */}
        <div className="finord-filters ff-filters">
          <div className="finord-searchbox">
            <input className="finord-search-input ff-search" placeholder="请输入称呼/手机号搜索" />
            <button className="finord-btn finord-btn-primary">搜索</button>
          </div>
          <div className="finord-searchbox">
            <span className="finord-search-label">性别:</span>
            <select className="finord-select">
              <option>不限</option>
            </select>
          </div>
          <div className="ff-landing-wrap">
            <select className="finord-select ff-landing">
              <option>请选择落地页</option>
            </select>
          </div>
        </div>

        {/* 表格 */}
        <div className="finord-table-wrap">
          <table className="finord-table ff-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>称呼</th>
                <th>性别</th>
                <th>手机号</th>
                <th>更多信息</th>
                <th>落地页</th>
                <th>提交时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={8} className="ecl-empty">
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

      {fieldOpen && <FieldManagerDrawer onClose={() => setFieldOpen(false)} />}
    </div>
  );
}

interface FieldRow {
  name: string;
  builtIn: boolean;
  required: boolean;
  guide: string;
  type: string;
}

const FIELD_ROWS: FieldRow[] = [
  { name: "称呼", builtIn: true, required: true, guide: "称呼", type: "单行填写文本" },
  { name: "头像", builtIn: true, required: false, guide: "头像", type: "单行填写文本" },
  { name: "职业", builtIn: true, required: true, guide: "请选择", type: "下拉单项选择" },
  { name: "学历", builtIn: true, required: true, guide: "请选择", type: "下拉单项选择" },
  { name: "体重", builtIn: true, required: true, guide: "请选择", type: "单行数字填写" },
  { name: "现居", builtIn: true, required: true, guide: "请选择", type: "单行填写文本" },
  { name: "微信", builtIn: true, required: true, guide: "微信", type: "单行填写文本" },
  { name: "性别", builtIn: true, required: true, guide: "性别", type: "下拉单项选择" },
  { name: "出生", builtIn: true, required: true, guide: "请选择", type: "单行填写文本" },
  { name: "婚况", builtIn: true, required: true, guide: "请选择", type: "下拉单项选择" },
  { name: "身高", builtIn: true, required: true, guide: "请选择", type: "单行填写文本" },
  { name: "收入", builtIn: true, required: true, guide: "请选择", type: "下拉单项选择" },
  { name: "籍贯", builtIn: true, required: true, guide: "请选择", type: "单行填写文本" },
  { name: "手机", builtIn: true, required: true, guide: "手机", type: "单行填写文本" },
];

function FieldManagerDrawer({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div className="tlc-mask" onClick={onClose} />
      <div className="tlc-panel ffm-panel">
        <div className="tlc-panel-head">
          <div className="tlc-panel-head-left">
            <button className="tlc-x" onClick={onClose} aria-label="关闭"><X size={18} /></button>
            <span className="tlc-panel-title">字段管理</span>
          </div>
          <div className="ffm-head-actions">
            <button className="finord-btn finord-btn-primary">＋ 新建字段</button>
          </div>
        </div>
        <div className="tlc-panel-body ffm-body">
          <div className="ffm-notice">① 称呼、性别、手机号码为系统中客户资料的同名字段一致，入库时会将同步的数据新建字段一旦在被落地页中添加使用，则不支持删除</div>
          <div className="ffm-table-wrap">
            <table className="ffm-table">
              <thead>
                <tr>
                  <th>字段名称</th>
                  <th>引导文案</th>
                  <th>字段类型</th>
                  <th>必填</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {FIELD_ROWS.map((r) => (
                  <tr key={r.name}>
                    <td className="ffm-name">
                      {r.name} <span className="ffm-builtin">（内置）</span>
                      {r.required && <span className="ffm-req"> (必填)</span>}
                    </td>
                    <td>{r.guide}</td>
                    <td>{r.type}</td>
                    <td className={r.required ? "ffm-yes" : "ffm-no"}>{r.required ? "是" : "否"}</td>
                    <td><a className="finord-link">编辑</a></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
