"use client";

import { useCallback, useEffect, useState } from "react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import AdminPagination from "@/components/AdminPagination";
import { adminEndpoints, type AdminTicketItem } from "@/lib/admin-endpoints";
import { showConfigToast } from "@/lib/platform-config";

export default function SystemFeedbackPage() {
  const [rows, setRows] = useState<AdminTicketItem[]>([]);
  const [status, setStatus] = useState("all");
  const [feedbackType, setFeedbackType] = useState("all");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<AdminTicketItem | null>(null);

  const load = useCallback(async () => {
    try {
      const result = await adminEndpoints.tickets({ page, page_size: pageSize, status, feedback_type: feedbackType, keyword: keyword || undefined });
      setRows(result.items);
      setTotal(result.total);
    } catch (error) {
      showConfigToast(error instanceof Error ? error.message : "加载失败", "error");
    }
  }, [feedbackType, keyword, page, pageSize, status]);

  useEffect(() => { void load(); }, [load]);

  return (
    <div className="service-page">
      <AdminBreadcrumb
        items={[
          { label: "首页", href: "/" },
          { label: "官方服务" },
          { label: "工单反馈" },
        ]}
      />
      <section className="service-notice"><h2>💡 须知</h2><p>如果您发现系统中的任何使用问题、BUG、以及产品需求建议都可以在这里提交给我们，我们会在第一时间对您的工单进行有效答复</p></section>
      <div className="admin-card">
        <div className="finord-filters">
          <select className="finord-select" value={feedbackType} onChange={(event) => { setFeedbackType(event.target.value); setPage(1); }}><option value="all">全部类型</option><option value="BUG">BUG</option><option value="咨询">咨询</option><option value="建议">建议</option></select>
          <select className="finord-select" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}><option value="all">全部状态</option><option value="待处理">待处理</option><option value="处理中">处理中</option><option value="已处理">已处理</option></select>
          <input className="finord-search-input" placeholder="按工单号/标题搜" value={keyword} onChange={(event) => setKeyword(event.target.value)} />
          <button className="finord-btn finord-btn-primary" onClick={() => { setPage(1); void load(); }}>搜索</button>
        </div>
        <div className="finord-table-wrap"><table className="finord-table"><thead><tr><th>工单ID</th><th>反馈类型</th><th>标题</th><th>提交人</th><th>反馈时间</th><th>状态</th><th>答复时间</th><th>操作</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id}><td>{row.ticket_no}</td><td>{row.feedback_type}</td><td>{row.title}</td><td>{row.submitter_name || "-"}</td><td>{row.created_at.replace("T", " ").slice(0, 19)}</td><td>{row.status}</td><td>{row.replied_at ? row.replied_at.replace("T", " ").slice(0, 19) : "-"}</td><td><button className="finord-link" onClick={() => setSelected(row)}>查看/回复</button></td></tr>)}{rows.length === 0 && <tr><td colSpan={8} style={{ textAlign: "center", padding: 32 }}>暂无数据</td></tr>}</tbody></table></div>
        <AdminPagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} />
      </div>
      {selected && <TicketDrawer ticket={selected} onClose={() => setSelected(null)} onSaved={() => { setSelected(null); void load(); }} />}
    </div>
  );
}

function TicketDrawer({ ticket, onClose, onSaved }: { ticket: AdminTicketItem; onClose: () => void; onSaved: () => void }) {
  const [reply, setReply] = useState(ticket.reply_content || "");
  const submit = async () => {
    if (!reply.trim()) return;
    try { await adminEndpoints.replyTicket(ticket.id, reply.trim()); showConfigToast("回复成功", "ok"); onSaved(); }
    catch (error) { showConfigToast(error instanceof Error ? error.message : "回复失败", "error"); }
  };
  return <><div className="tlc-mask" onClick={onClose} /><div className="tlc-panel"><div className="tlc-panel-head"><span className="tlc-panel-title">{ticket.ticket_no} {ticket.title}</span><button className="tlc-x" onClick={onClose}>×</button></div><div className="tlc-panel-body"><p>{ticket.content}</p><textarea className="finord-textarea" value={reply} onChange={(event) => setReply(event.target.value)} placeholder="请输入答复内容" /><button className="finord-btn finord-btn-primary" onClick={() => void submit()}>提交回复</button></div></div></>;
}
