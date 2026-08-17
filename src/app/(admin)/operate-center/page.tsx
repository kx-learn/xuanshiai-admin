"use client";

import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import AdminPageHeader from "@/components/AdminPageHeader";
import { Button } from "@/components/ui/button";

const courses: { id: number; title: string; description: string; duration: string; students: number; color: string }[] = [];

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
