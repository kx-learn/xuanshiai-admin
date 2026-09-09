"use client";

import { useEffect, useState } from "react";
import { X, Inbox } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";

/**
 * 消息群发（纯前端演示，无后端接口）
 * 页面结构：面包屑 / 须知 / 已创建的群发消息卡片（标题 + 添加新模板按钮 + 表格）
 * 点击「添加新模板」弹出右侧「新建群发消息」抽屉（须知 + 模板列表）
 */

interface SendRow {
  id: number;
  title: string; // 模板标题
  platformTpl: string; // 对应公众号平台模板
  updatetime: string; // 更新时间
}

interface TplItem {
  no: string;
}

const tplList: TplItem[] = [
  { no: "订阅模板消息-g5pglJjQpmiNGVDNknS6r0G[CfmGrIkSOKFTIknaQj 1E" },
];

const gzhChildren = [
  { label: "参数配置", href: "/wechat-config" },
  { label: "关注粉丝", href: "/wechat-fans" },
  { label: "菜单配置", href: "/wechat-menu" },
  { label: "自动回复", href: "/wechat-autoreply" },
  { label: "模板消息", href: "/wechat-template" },
  { label: "消息群发", href: "/wechat-send" },
];

function SendDrawer({ onClose, onPick }: { onClose: () => void; onPick: (no: string) => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="sd-modal-mask" onClick={onClose}>
      <div className="sd-modal" onClick={(e) => e.stopPropagation()}>
        <div className="sd-modal-header">
          <span className="sd-modal-title">新建群发消息</span>
          <button type="button" className="sd-modal-close" aria-label="关闭" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="sd-modal-body">
          {/* 须知 */}
          <div className="sd-modal-notice">
            <span className="sd-notice-icon">i</span>
            <span>切勿滥用和违规使用本功能，微信模板消息违规说明</span>
          </div>

          {/* 模板列表 */}
          <div className="sd-tpl-box">
            <div className="sd-tpl-head">
              <div className="sd-tpl-no">模板</div>
              <div className="sd-tpl-act">选择</div>
            </div>
            {tplList.length === 0 ? (
              <div className="sd-tpl-empty">暂无模板</div>
            ) : (
              tplList.map((tpl) => (
                <div key={tpl.no} className="sd-tpl-row">
                  <div className="sd-tpl-no">
                    {tpl.no}
                    <svg className="sd-tpl-help" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                  </div>
                  <div className="sd-tpl-act">
                    <button type="button" className="sd-pick-btn" onClick={() => onPick(tpl.no)}>
                      确定
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WechatSendPage() {
  const [data, setData] = useState<SendRow[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const pickTpl = (no: string) => {
    const now = new Date();
    const updatetime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    setData((cur) => [
      ...cur,
      { id: cur.length + 1, title: "新建群发", platformTpl: no, updatetime },
    ]);
    setDrawerOpen(false);
  };

  return (
    <div>
      <AdminBreadcrumb
        items={[
          { label: "首页", href: "/" },
          { label: "公众号", href: "/wechat-send", children: gzhChildren },
          { label: "消息群发" },
        ]}
      />

      {/* 须知 */}
      <div className="sd-notice">
        <div className="sd-notice-title">
          <span className="sd-notice-icon">i</span>须知
        </div>
        <div className="sd-notice-lines">
          <p>基于微信公众平台模板消息的群发系统.网站可用来给网站会员、粉丝（包括关注了公众号但未注册为网站会员的粉丝）群发推送各种通知和消息</p>
          <p>微信模板消息群发推送有别于服务号的自带群发推送，他是不受到条数限制的，合理善用本功能将给网站的营销推广带来巨大的帮助</p>
          <p>支持按照粉丝分组群发，实现精准推送</p>
          <p>可以自定义每个消息模板的链接，支持关闭链接、小程序链接、网页链接</p>
          <p>可以自由编辑消息模板的每个字段的文字内容、颜色、变量，方便灵活实现与所选择的模板进行匹配，已达到最佳的推送效果</p>
          <p>使用步骤：1、新建群发   2、编辑模板内容   3、发送</p>
        </div>
      </div>

      {/* 已创建的群发消息 */}
      <div className="admin-card">
        <div className="sd-card-head">
          <span className="sd-card-title">已创建的群发消息</span>
          <button type="button" className="sd-add-btn" onClick={() => setDrawerOpen(true)}>
            + 添加新模板
          </button>
        </div>
        <div className="admin-card-body px-6 pb-6">
          {/* 表格 */}
          <div className="mt-2 overflow-auto rounded-[6px] border border-[#f0f0f0]">
            <table className="sd-table">
              <thead>
                <tr className="bg-[#fafafa]">
                  <th className="sd-th sd-th-id">ID</th>
                  <th className="sd-th">模板标题</th>
                  <th className="sd-th">对应公众号平台模板</th>
                  <th className="sd-th">更新时间</th>
                  <th className="sd-th sd-th-act">操作</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-0">
                      <div className="flex flex-col items-center justify-center py-16 text-sm text-[#999]">
                        <Inbox className="mb-2 h-10 w-10 text-[#d8dde6]" strokeWidth={1.2} />
                        暂无数据
                      </div>
                    </td>
                  </tr>
                ) : (
                  data.map((r) => (
                    <tr key={r.id} className="border-b border-[#f0f0f0] transition-colors hover:bg-[#fafafa]">
                      <td className="sd-td sd-td-id">{r.id}</td>
                      <td className="sd-td">{r.title}</td>
                      <td className="sd-td">{r.platformTpl}</td>
                      <td className="sd-td">{r.updatetime}</td>
                      <td className="sd-td sd-td-act">
                        <button type="button" className="sd-link">配置</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {drawerOpen && <SendDrawer onClose={() => setDrawerOpen(false)} onPick={pickTpl} />}
    </div>
  );
}
