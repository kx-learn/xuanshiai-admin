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

// Mock data for member trend
const memberTrendData = [
  { date: "07-01", count: 8 },
  { date: "07-02", count: 12 },
  { date: "07-03", count: 5 },
  { date: "07-04", count: 15 },
  { date: "07-05", count: 10 },
  { date: "07-06", count: 18 },
  { date: "07-07", count: 7 },
  { date: "07-08", count: 14 },
  { date: "07-09", count: 20 },
  { date: "07-10", count: 11 },
  { date: "07-11", count: 9 },
  { date: "07-12", count: 16 },
  { date: "07-13", count: 13 },
  { date: "07-14", count: 22 },
  { date: "07-15", count: 19 },
];

const leadTrendData = [
  { date: "07-01", count: 3 },
  { date: "07-02", count: 7 },
  { date: "07-03", count: 2 },
  { date: "07-04", count: 8 },
  { date: "07-05", count: 5 },
  { date: "07-06", count: 9 },
  { date: "07-07", count: 4 },
  { date: "07-08", count: 6 },
  { date: "07-09", count: 11 },
  { date: "07-10", count: 3 },
  { date: "07-11", count: 7 },
  { date: "07-12", count: 5 },
  { date: "07-13", count: 8 },
  { date: "07-14", count: 12 },
  { date: "07-15", count: 6 },
];

// Mock data for income trend
const incomeTrendData = [
  { date: "07-01", amount: 320 },
  { date: "07-02", amount: 450 },
  { date: "07-03", amount: 200 },
  { date: "07-04", amount: 580 },
  { date: "07-05", amount: 350 },
  { date: "07-06", amount: 690 },
  { date: "07-07", amount: 280 },
  { date: "07-08", amount: 520 },
  { date: "07-09", amount: 750 },
  { date: "07-10", amount: 410 },
  { date: "07-11", amount: 300 },
  { date: "07-12", amount: 620 },
  { date: "07-13", amount: 480 },
  { date: "07-14", amount: 850 },
  { date: "07-15", amount: 560 },
];

const offlineIncomeData = [
  { date: "07-01", amount: 0 },
  { date: "07-02", amount: 150 },
  { date: "07-03", amount: 0 },
  { date: "07-04", amount: 0 },
  { date: "07-05", amount: 200 },
  { date: "07-06", amount: 0 },
  { date: "07-07", amount: 0 },
  { date: "07-08", amount: 100 },
  { date: "07-09", amount: 0 },
  { date: "07-10", amount: 0 },
  { date: "07-11", amount: 300 },
  { date: "07-12", amount: 0 },
  { date: "07-13", amount: 0 },
  { date: "07-14", amount: 0 },
  { date: "07-15", amount: 0 },
];

// Pie chart data
const genderData = [
  { name: "男会员", value: 410, percent: "65%", color: "#3658f7" },
  { name: "女会员", value: 228, percent: "35%", color: "#ff7875" },
];

// Revenue share data
const revenueShareData = [
  { name: "VIP会员", percent: 38, color: "#3658f7" },
  { name: "其他", percent: 24, color: "#5281f3" },
  { name: "活动报名", percent: 21, color: "#ffc069" },
  { name: "积分充值", percent: 4, color: "#95de64" },
  { name: "送礼物", percent: 4, color: "#ff7875" },
];

type MemberTab = "member" | "lead";
type IncomeTab = "online" | "offline";

export default function DashboardCharts() {
  const [memberTab, setMemberTab] = useState<MemberTab>("member");
  const [incomeTab, setIncomeTab] = useState<IncomeTab>("online");

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
            <div className="text-xl font-semibold text-[#333]">638人</div>
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
