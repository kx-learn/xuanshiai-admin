interface StatItem {
  value: string;
  label: string;
  hasInfo?: boolean;
}

const statsData: StatItem[] = [
  { value: "106", label: "上线时间(天)", hasInfo: true },
  { value: "731", label: "平台用户(人)" },
  { value: "0", label: "公众号粉丝(人)" },
  { value: "6", label: "客源线索（条）" },
  { value: "638", label: "相亲会员(人)" },
  { value: "410", label: "男会员(人)" },
  { value: "228", label: "女会员(人)" },
  { value: "109", label: "线上VIP(人)" },
  { value: "0", label: "线下VIP(人)" },
  { value: "4,126.8", label: "线上收益(元)" },
  { value: "0", label: "线下收益(元)" },
  { value: "1", label: "服务红娘(人)" },
  { value: "9", label: "推广红娘(人)" },
  { value: "2", label: "成功脱单(人)" },
];

export default function DashboardStats() {
  return (
    <div className="flex flex-wrap gap-0">
      {statsData.map((stat, index) => (
        <div
          key={index}
          className="flex flex-col items-center justify-center py-4 px-3 min-w-[100px] flex-1 border-r border-b border-[#f0f0f0] bg-white hover:shadow-sm transition-shadow"
        >
          <div className="text-2xl font-semibold text-[#333333] mb-1 flex items-center gap-1">
            {stat.value}
            {stat.hasInfo && (
              <svg
                className="w-3.5 h-3.5 text-[#999]"
                viewBox="0 0 1024 1024"
                fill="currentColor"
              >
                <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 708c-22.1 0-40-17.9-40-40s17.9-40 40-40 40 17.9 40 40-17.9 40-40 40zm62.9-219.5L533 572V360c0-13.3-10.7-24-24-24s-24 10.7-24 24v232c0 6.4 2.5 12.5 7 17l60 60c9.4 9.4 24.6 9.4 33.9 0 9.4-9.4 9.4-24.6 0-33.9l-11-12.6z" />
              </svg>
            )}
          </div>
          <div className="text-xs text-[#999] whitespace-nowrap">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
