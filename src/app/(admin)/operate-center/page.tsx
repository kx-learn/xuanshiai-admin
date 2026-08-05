"use client";

import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import AdminPageHeader from "@/components/AdminPageHeader";
import { Button } from "@/components/ui/button";

const courses = [
  { id: 1, title: "恋爱心理学入门", description: "了解两性心理学基础知识，提升恋爱沟通能力", duration: "共12课时", students: 2356, color: "#3658f7" },
  { id: 2, title: "约会技巧实战", description: "从邀约到约会全流程指导，让你不再紧张", duration: "共8课时", students: 1823, color: "#52c41a" },
  { id: 3, title: "情感沟通艺术", description: "学会表达与倾听，建立健康的亲密关系沟通模式", duration: "共15课时", students: 3102, color: "#fa8c16" },
  { id: 4, title: "婚姻经营之道", description: "婚后关系维护指南，让爱情持久保鲜", duration: "共10课时", students: 1567, color: "#722ed1" },
  { id: 5, title: "形象改造计划", description: "从穿搭到气质全方位提升个人形象魅力", duration: "共6课时", students: 2890, color: "#13c2c2" },
  { id: 6, title: "脱单行动指南", description: "系统化脱单方法论，高效找到合适伴侣", duration: "共20课时", students: 4231, color: "#ff4d4f" },
];

export default function OperateCenterPage() {
  return (
    <div>
      <AdminBreadcrumb
        items={[
          { label: "首页", href: "/" },
          { label: "运营中心" },
          { label: "婚创学苑" },
        ]}
      />
      <AdminPageHeader title="婚创学苑" />

      <div className="grid grid-cols-3 gap-4">
        {courses.map((course) => (
          <div key={course.id} className="admin-card overflow-hidden">
            <div
              className="h-40 flex items-center justify-center relative"
              style={{ backgroundColor: `${course.color}15` }}
            >
              <div className="text-center">
                <svg className="size-12 mx-auto mb-2" viewBox="0 0 24 24" fill="none" stroke={course.color} strokeWidth="1.5">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                <span className="text-xs" style={{ color: course.color }}>婚创学苑</span>
              </div>
              <div className="absolute bottom-2 right-2 text-xs text-white px-2 py-0.5 rounded" style={{ backgroundColor: course.color }}>
                {course.duration}
              </div>
            </div>
            <div className="p-4">
              <div className="font-medium text-sm text-[#333] mb-1">{course.title}</div>
              <div className="text-xs text-[#999] mb-3 leading-relaxed">{course.description}</div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#999]">{course.students.toLocaleString()} 人已学</span>
                <Button variant="primary" size="sm">查看课程</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
