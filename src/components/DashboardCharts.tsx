"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

type MemberTab = "member" | "lead";
type IncomeTab = "online" | "offline";

function asNumber(value: unknown) {
  return typeof value === "number" ? value : Number(value ?? 0) || 0;
}

function trend(value: unknown, metric: "count" | "amount") {
  if (!Array.isArray(value)) return [];
  return value.map((item) => {
    const row = item as Record<string, unknown>;
    return { date: String(row.date ?? row.day ?? ""), [metric]: asNumber(row[metric]) };
  });
}

function revenue(value: unknown) {
  if (!Array.isArray(value)) return [];
  const colors = ["#5a72ef", "#7e92f5", "#f4bd56", "#92cf69", "#f07b78"];
  return value.map((item, index) => {
    const row = item as Record<string, unknown>;
    return { name: String(row.name ?? row.label ?? "其他"), percent: asNumber(row.percent), color: String(row.color ?? colors[index % colors.length]) };
  });
}

export default function DashboardCharts({ stats }: { stats: Record<string, unknown> }) {
  const [memberTab, setMemberTab] = useState<MemberTab>("member");
  const [incomeTab, setIncomeTab] = useState<IncomeTab>("online");
  const memberTrendData = trend(stats.member_trends, "count");
  const leadTrendData = trend(stats.lead_trends, "count");
  const incomeTrendData = trend(stats.online_income_trends, "amount");
  const offlineIncomeData = trend(stats.offline_income_trends, "amount");
  const totalMembers = asNumber(stats.member_count);
  const maleMembers = asNumber(stats.male_member_count);
  const femaleMembers = asNumber(stats.female_member_count);
  const genderData = [
    { name: "男会员", value: maleMembers, percent: totalMembers ? `${Math.round(maleMembers / totalMembers * 100)}%` : "0%", color: "#5a72ef" },
    { name: "女会员", value: femaleMembers, percent: totalMembers ? `${Math.round(femaleMembers / totalMembers * 100)}%` : "0%", color: "#f07b78" },
  ];
  const revenueShareData = revenue(stats.revenue_share);

  const memberData = memberTab === "member" ? memberTrendData : leadTrendData;
  const incomeData = incomeTab === "online" ? incomeTrendData : offlineIncomeData;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
      {/* Member Trend Chart */}
      <div className="admin-card lg:col-span-3">
        <div className="admin-card-header">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMemberTab("member")}
              className={`text-sm pb-3 border-b-2 transition-colors ${
                memberTab === "member"
                  ? "text-[#3658f7] border-[#3658f7]"
                  : "text-[#999] border-transparent hover:text-[#333]"
              }`}
            >
              近15日新增相亲会员
            </button>
            <button
              onClick={() => setMemberTab("lead")}
              className={`text-sm pb-3 border-b-2 transition-colors ${
                memberTab === "lead"
                  ? "text-[#3658f7] border-[#3658f7]"
                  : "text-[#999] border-transparent hover:text-[#333]"
              }`}
            >
              近15日新增客源线索
            </button>
          </div>
        </div>
        <div className="admin-card-body">
          <div className="text-xs text-[#999] mb-2">单位：人</div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={memberData}>
              <defs>
                <linearGradient id="memberGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3658f7" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3658f7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: "#999" }}
                axisLine={{ stroke: "#f0f0f0" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#999" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 4,
                  border: "1px solid #f0f0f0",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#3658f7"
                strokeWidth={2}
                fill="url(#memberGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gender Pie Chart */}
      <div className="admin-card">
        <div className="admin-card-header">
          <span className="font-medium text-base">男女会员占比</span>
        </div>
        <div className="admin-card-body flex flex-col items-center">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={genderData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={2}
                dataKey="value"
              >
                {genderData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-2 w-full mt-2">
            {genderData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-[#666] flex-1">{item.name}</span>
                <span className="text-sm text-[#333] font-medium">
                  {item.percent}
                </span>
                <span className="text-xs text-[#999]">{item.value}人</span>
              </div>
            ))}
          </div>
          <div className="text-center mt-4 pt-4 border-t border-[#f0f0f0] w-full">
            <div className="text-xs text-[#999]">会员总数</div>
            <div className="text-xl font-semibold text-[#333]">{totalMembers}人</div>
          </div>
        </div>
      </div>

      {/* Income Trend Chart */}
      <div className="admin-card lg:col-span-3">
        <div className="admin-card-header">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIncomeTab("online")}
              className={`text-sm pb-3 border-b-2 transition-colors ${
                incomeTab === "online"
                  ? "text-[#3658f7] border-[#3658f7]"
                  : "text-[#999] border-transparent hover:text-[#333]"
              }`}
            >
              近15日线上收入
            </button>
            <button
              onClick={() => setIncomeTab("offline")}
              className={`text-sm pb-3 border-b-2 transition-colors ${
                incomeTab === "offline"
                  ? "text-[#3658f7] border-[#3658f7]"
                  : "text-[#999] border-transparent hover:text-[#333]"
              }`}
            >
              近15日线下收入
            </button>
          </div>
        </div>
        <div className="admin-card-body">
          <div className="text-xs text-[#999] mb-2">单位：元</div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={incomeData}>
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3658f7" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3658f7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: "#999" }}
                axisLine={{ stroke: "#f0f0f0" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#999" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 4,
                  border: "1px solid #f0f0f0",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#3658f7"
                strokeWidth={2}
                fill="url(#incomeGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue Share Chart */}
      <div className="admin-card">
        <div className="admin-card-header">
          <span className="font-medium text-base">线上收益占比 (前5)</span>
        </div>
        <div className="admin-card-body">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={revenueShareData}
              layout="vertical"
              margin={{ left: 10, right: 30 }}
            >
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 12, fill: "#666" }}
                axisLine={false}
                tickLine={false}
                width={70}
              />
              <Bar dataKey="percent" radius={[0, 4, 4, 0]} barSize={20}>
                {revenueShareData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
