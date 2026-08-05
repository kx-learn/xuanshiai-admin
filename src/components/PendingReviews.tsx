import Link from "next/link";

interface PendingItem {
  label: string;
  count: number;
  action: string;
}

const pendingItems: PendingItem[] = [
  { label: "相亲会员", count: 92, action: "资料待审" },
  { label: "会员牵线", count: 3, action: "待牵线" },
  { label: "约见申请", count: 1, action: "待处理" },
  { label: "活动报名", count: 2, action: "待处理" },
  { label: "推广申请", count: 0, action: "待处理" },
  { label: "提现管理", count: 5, action: "待处理" },
  { label: "网友举报", count: 0, action: "待处理" },
  { label: "短视频", count: 0, action: "待审" },
  { label: "积分兑换", count: 1, action: "待处理" },
  { label: "会员承诺", count: 17, action: "待审" },
  { label: "房产认证", count: 0, action: "待审" },
  { label: "学历认证", count: 0, action: "待审" },
  { label: "其他认证", count: 0, action: "待审" },
];

const quickActions = [
  "添加账号",
  "添加资料",
  "添加红娘",
  "发布活动",
  "发布视频",
];

export default function PendingReviews() {
  return (
    <div className="admin-card mb-4">
      {/* Header */}
      <div className="admin-card-header flex items-center justify-between">
        <span className="font-medium text-base">待审工作</span>
        <div className="flex items-center gap-2">
          {quickActions.map((action) => (
            <Link
              key={action}
              href="#"
              className="text-xs text-[#3658f7] hover:text-[#5281f3] bg-[#edf2ff] hover:bg-[#dce4ff] px-3 py-1 rounded transition-colors"
            >
              {action}
            </Link>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="admin-card-body">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {pendingItems.map((item) => (
            <Link
              key={item.label}
              href="#"
              className="flex flex-col items-center gap-1 p-3 rounded hover:bg-[#fafafa] transition-colors border border-transparent hover:border-[#f0f0f0]"
            >
              <span className="text-[#333] font-medium text-sm">
                {item.label}
              </span>
              <span
                className={`text-lg font-bold ${
                  item.count > 0 ? "text-[#ff4d4f]" : "text-[#999]"
                }`}
              >
                {item.count}
              </span>
              <span className="text-xs text-[#999]">{item.action}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
