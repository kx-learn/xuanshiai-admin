"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import ListPage, { type ColumnDef, type SearchField } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "编号", key: "id", width: 70, align: "center" },
  { title: "活动名称", key: "activityName", width: 180 },
  { title: "男嘉宾", key: "maleGuest", width: 100 },
  { title: "女嘉宾", key: "femaleGuest", width: 100 },
  {
    title: "是否互选",
    key: "isMutual",
    width: 90,
    align: "center",
    render: (row: Record<string, unknown>) => {
      const isMutual = row.isMutual as boolean;
      return (
        <span className={`inline-block px-2 py-0.5 text-xs rounded ${isMutual ? "bg-[#f6ffed] text-[#52c41a] border border-[#b7eb8f]" : "bg-[#fff2f0] text-[#ff4d4f] border border-[#ffccc7]"}`}>
          {isMutual ? "是" : "否"}
        </span>
      );
    },
  },
  { title: "时间", key: "time", width: 180 },
];

const data: Record<string, unknown>[] = [
  { id: 1, activityName: "七夕浪漫互选会", maleGuest: "张伟", femaleGuest: "李娜", isMutual: true, time: "2026-07-13 14:30:00" },
  { id: 2, activityName: "金秋十月相亲会", maleGuest: "王强", femaleGuest: "陈静", isMutual: false, time: "2026-07-12 15:30:00" },
  { id: 3, activityName: "周末趣味互选", maleGuest: "李军", femaleGuest: "王芳", isMutual: true, time: "2026-07-11 16:30:00" },
  { id: 4, activityName: "520心动互选", maleGuest: "赵明", femaleGuest: "周梅", isMutual: false, time: "2026-07-10 17:30:00" },
  { id: 5, activityName: "新年交友派对", maleGuest: "刘波", femaleGuest: "孙丽", isMutual: true, time: "2026-07-09 18:30:00" },
  { id: 6, activityName: "春之恋互选活动", maleGuest: "周浩", femaleGuest: "吴敏", isMutual: true, time: "2026-07-08 19:30:00" },
  { id: 7, activityName: "精英专场互选", maleGuest: "吴勇", femaleGuest: "林红", isMutual: false, time: "2026-07-07 20:30:00" },
  { id: 8, activityName: "90后专场互选", maleGuest: "郑刚", femaleGuest: "赵娟", isMutual: true, time: "2026-07-06 21:30:00" },
  { id: 9, activityName: "公务员专场互选", maleGuest: "钱峰", femaleGuest: "郑燕", isMutual: false, time: "2026-07-05 22:30:00" },
  { id: 10, activityName: "海归专场互选", maleGuest: "冯磊", femaleGuest: "冯婷", isMutual: true, time: "2026-07-04 23:30:00" },
  { id: 11, activityName: "七夕浪漫互选会", maleGuest: "褚杰", femaleGuest: "褚兰", isMutual: true, time: "2026-07-03 24:30:00" },
  { id: 12, activityName: "金秋十月相亲会", maleGuest: "卫华", femaleGuest: "卫萍", isMutual: false, time: "2026-07-02 25:30:00" },
];

const searchFields: SearchField[] = [
  { label: "活动名称", type: "input", placeholder: "请输入活动名称", width: 180 },
];

export default function MutualSelectionRecordPage() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("活动报名", "互选记录")}
      pageTitle="互选记录"
      searchFields={searchFields}
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: 12 }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
