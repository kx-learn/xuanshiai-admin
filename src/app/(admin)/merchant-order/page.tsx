"use client";

import { Download } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const breadcrumb = getBreadcrumb("商家联盟", "订单管理");

const columns = ["ID", "下单商品", "商家", "下单人", "下单时间", "订单状态", "订单金额", "方式/时间", "核销状态", "操作"];

export default function MerchantOrderPage() {
  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      <div className="ecl-notice">
        <div className="ecl-notice-body">
          <span className="ecl-notice-ic">i</span>
          <div className="ecl-notice-text">
            <div className="ecl-notice-title">须知</div>
            <p>1、未支付、已支付但未核销状态下的订单均可随时取消订单；</p>
            <p>2、已支付订单（无论是否核销），若需退款，请在"财务管理-收入明细"中操作订单不可删除</p>
          </div>
        </div>
      </div>

      <div className="finord-card mo-card">
        <div className="mo-filters">
          <div className="mo-filters-row">
            <select className="mo-select"><option>全部商家</option></select>
            <select className="mo-select"><option>订单状态</option></select>
            <select className="mo-select"><option>核销状态</option></select>
            <div className="mo-searchbox">
              <input className="mo-input" placeholder="按商品关键词" />
            </div>
            <div className="mo-searchbox">
              <input className="mo-input" placeholder="按订单号" />
            </div>
            <select className="mo-select"><option>按昵称</option></select>
            <input className="mo-input" placeholder="请输入" />
          </div>
          <div className="mo-filters-row">
            <div className="mo-daterange">
              <span className="mo-text-muted">核销时间开始</span>
              <input className="mo-date" type="date" />
              <span className="mo-text-muted">→</span>
              <span className="mo-text-muted">核销时间结束</span>
              <input className="mo-date" type="date" />
            </div>
            <button className="finord-btn finord-btn-primary mo-export-btn"><Download size={14} /> 导出EXCEL</button>
          </div>
        </div>

        <div className="finord-table-wrap">
          <table className="finord-table mo-table">
            <thead>
              <tr>
                {columns.map((c) => <th key={c}>{c}</th>)}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={columns.length} className="mo-empty">
                  <div className="mo-empty-inner">
                    <div className="mo-empty-icon">📦</div>
                    <div className="mo-empty-text">暂无数据</div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}