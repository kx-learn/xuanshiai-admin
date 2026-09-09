"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { useEffect, useRef, useState } from "react";
import {
  useConfigDomain,
  showConfigToast,
  type Dict,
} from "@/lib/platform-config";

type Tag = { id: number; label: string; emoji?: string };

type Section = {
  key: string;
  title: string;
  tags: Tag[];
};

let tagSeq = 0;
const t = (label: string, emoji?: string): Tag => ({ id: ++tagSeq, label, emoji });

const sections: Section[] = [
  {
    key: "reject",
    title: "审核不通过原因模板",
    tags: [
      t("照片不符合要求，请上传真人照片"),
      t("部分资料不真实，请修改后再次提交审核"),
      t("未实名认证，请完成实名认证后再次提交审核"),
      t("没有支付资料审核费"),
    ],
  },
  {
    key: "memberTag",
    title: "会员标签",
    tags: [
      t("高颜值"),
      t("高收入"),
      t("985毕业"),
      t("211毕业"),
      t("事业单位"),
      t("双一流"),
      t("海归"),
      t("身材好"),
      t("博士"),
      t("央企国企"),
      t("银行金融"),
      t("公务员"),
    ],
  },
  {
    key: "source",
    title: "客户来源",
    tags: [
      t("抖音"),
      t("微信群"),
      t("本地群"),
      t("身边朋友"),
      t("同行群"),
      t("朋友圈"),
      t("朋友介绍"),
      t("QQ"),
      t("其他渠道"),
      t("落地页"),
    ],
  },
  {
    key: "sourceStatus",
    title: "客源状态",
    tags: [t("找对象中"), t("接触中"), t("恋爱中"), t("已结婚"), t("已到门店")],
  },
  {
    key: "intent",
    title: "客户意向",
    tags: [
      t("A类未接"),
      t("B类初步沟通"),
      t("C类深入沟通未缔结"),
      t("D类待确定到店时间"),
      t("E类已确定到店"),
      t("F类签约需二通"),
      t("G类已到店未签约"),
      t("I类已签单"),
      t("J类放弃资源"),
    ],
  },
  {
    key: "nation",
    title: "民族",
    tags: [t("汉族"), t("彝族"), t("回族"), t("维吾尔族"), t("其他少数民族")],
  },
  {
    key: "marryIntent",
    title: "结婚意向",
    tags: [t("一年内结婚"), t("两年内结婚"), t("三年内结婚"), t("时机成熟时结婚")],
  },
  {
    key: "career",
    title: "职业",
    tags: [
      t("不限"),
      t("私企员工"),
      t("央企/国企"),
      t("外企"),
      t("事业单位"),
      t("公务员"),
      t("教师"),
      t("医生"),
      t("护士"),
      t("互联网行业"),
      t("自由职业"),
      t("军人"),
      t("工人"),
      t("服务业"),
      t("金融"),
      t("律师"),
      t("求职中"),
      t("在校学生"),
      t("个体老板"),
      t("公司高管"),
      t("美容师/健身教练"),
    ],
  },
  {
    key: "education",
    title: "学历",
    tags: [t("不限"), t("初中"), t("技校"), t("高中"), t("大专"), t("本科"), t("硕士"), t("博士")],
  },
  {
    key: "marriage",
    title: "婚姻状况",
    tags: [t("未婚"), t("离异未育"), t("离异不带孩"), t("离异带女孩"), t("离异带男孩"), t("丧偶")],
  },
  {
    key: "emotion",
    title: "情感状态",
    tags: [
      t("匹配推荐中"),
      t("约会进行中"),
      t("深度接触"),
      t("已经恋爱"),
      t("已见父母"),
      t("暂停服务"),
      t("恋爱分手"),
      t("已经领证"),
    ],
  },
  {
    key: "income",
    title: "收入状况",
    tags: [
      t("不限"),
      t("3千以下"),
      t("3-5千"),
      t("5-8千"),
      t("8千-1万元"),
      t("1-2万元"),
      t("2万以上"),
      t("5万以上"),
      t("年入百万"),
    ],
  },
  {
    key: "house",
    title: "购房情况",
    tags: [t("未购房"), t("已经购房"), t("需要时购置"), t("暂无购房能力")],
  },
  {
    key: "religion",
    title: "宗教信仰",
    tags: [t("无宗教信仰"), t("信奉佛教"), t("信奉基督教"), t("信奉伊斯兰教")],
  },
  {
    key: "personality",
    title: "性格标签",
    tags: [
      t("浪漫迷人"),
      t("成熟稳重"),
      t("风趣幽默"),
      t("乐观达观"),
      t("活泼可爱"),
      t("忠厚老实"),
      t("淳朴善良"),
      t("温柔体贴"),
      t("多愁善感"),
      t("新潮时尚"),
      t("热辣动感"),
      t("豪放不羁"),
    ],
  },
  {
    key: "hobby",
    title: "爱好标签",
    tags: [
      t("音乐"),
      t("看剧"),
      t("数码"),
      t("汽车"),
      t("时尚"),
      t("旅游"),
      t("游戏"),
      t("购物"),
      t("摄影"),
      t("宠物"),
      t("园艺"),
      t("绘画"),
      t("体育"),
      t("桌球"),
      t("追星", "🐴"),
      t("有健身习惯", "💪"),
      t("有副业", "💰"),
      t("写过歌", "✍️"),
      t("其他"),
      t("爱美", "💄"),
    ],
  },
  {
    key: "drink",
    title: "喝酒",
    tags: [t("不喝酒"), t("偶尔小酌"), t("应酬时需要喝酒"), t("经常喝酒")],
  },
  {
    key: "smoke",
    title: "吸烟",
    tags: [t("不吸烟"), t("偶尔吸烟"), t("经常吸烟")],
  },
  {
    key: "mateDrink",
    title: "择偶要求-喝酒",
    tags: [t("不接受喝酒"), t("可以偶尔小酌"), t("喝酒无所谓")],
  },
  {
    key: "mateSmoke",
    title: "择偶要求-吸烟",
    tags: [t("不接受吸烟"), t("可以偶尔吸烟"), t("吸烟无所谓")],
  },
  {
    key: "mateHouse",
    title: "择偶要求-购房",
    tags: [t("愿意和父母同住"), t("要有独立婚房"), t("住房无所谓")],
  },
  {
    key: "mateMarriage",
    title: "择偶要求-婚姻状况",
    tags: [t("不接受离异"), t("可接受离异未育"), t("接受离异有孩子"), t("视情况而定")],
  },
  {
    key: "confession",
    title: "自白模板",
    tags: [
      t("模板一"),
      t("模板二"),
      t("模板三"),
      t("模板四"),
      t("模板五"),
      t("模板六"),
      t("模板七"),
      t("模板八"),
      t("模板九"),
      t("模板十"),
    ],
  },
  {
    key: "follow",
    title: "跟进模板",
    tags: [t("核实资料"), t("邀约到店"), t("到店面谈"), t("服务交接")],
  },
  {
    key: "report",
    title: "举报分类",
    tags: [
      t("色情相关"),
      t("头像、虚假资料"),
      t("骚扰信息"),
      t("骗托、饭托、酒托"),
      t("诈骗钱财、虚假中奖信息"),
    ],
  },
  {
    key: "merchant",
    title: "商家分类",
    tags: [t("推荐餐饮"), t("新奇体验"), t("休闲玩乐"), t("生活服务"), t("结婚")],
  },
  { key: "unit", title: "单位分类", tags: [] },
  { key: "vip", title: "线下VIP套餐", tags: [t("线下")] },
  {
    key: "mbti",
    title: "人格类型（MBTI）",
    tags: [
      t("INTJ建筑师"),
      t("INTP逻辑学家"),
      t("ENTJ指挥官"),
      t("INFJ提倡者"),
      t("ENTP辩论家"),
      t("INFP调停者"),
      t("ENFJ主人公"),
      t("ENFP竞选者"),
      t("ISTJ物流师"),
      t("ISFJ守护者"),
      t("ESTJ总经理"),
      t("ISFP鉴赏家"),
      t("ISTP鉴赏家"),
      t("ESFP探索家"),
      t("ESTP企业家"),
      t("ESFJ表演者"),
    ],
  },
];

const BASE_DEFAULTS: Dict = { sections };

const SECTION_GAP = 2;

export default function PlatformBasePage() {
  const baseDomain = useConfigDomain<Dict>("platform_base_data", BASE_DEFAULTS);
  const [data, setData] = useState<Section[]>(sections);
  const [drawer, setDrawer] = useState<{ open: boolean; sectionKey: string; editing: Tag | null }>({
    open: false,
    sectionKey: "",
    editing: null,
  });
  const [name, setName] = useState("");
  const [content, setContent] = useState("");

  // 初次加载：服务端字典回填
  useEffect(() => {
    if (!baseDomain.ready) return;
    const raw = baseDomain.snapshot?.config?.sections;
    if (Array.isArray(raw) && raw.length > 0) {
      setData(raw as unknown as Section[]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseDomain.ready]);

  const mounted = useRef(false);
  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;
    void baseDomain.reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveBase = async (summary = "保存基础数据") => {
    const ok = await baseDomain.save({ sections: data }, summary);
    if (!ok && baseDomain.error) showConfigToast(baseDomain.error, "error");
    return ok;
  };

  // 改动即自动保存（含直接删除标签、图标/名称编辑入口）
  useEffect(() => {
    if (!baseDomain.ready) return;
    const timer = setTimeout(() => void saveBase("自动保存基础数据"), 800);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseDomain.ready, data]);

  const openAdd = (key: string) => {
    setDrawer({ open: true, sectionKey: key, editing: null });
    setName("");
    setContent("");
  };

  const openEdit = (key: string, tag: Tag) => {
    setDrawer({ open: true, sectionKey: key, editing: tag });
    setName(tag.label);
    setContent("");
  };

  const closeDrawer = () => setDrawer((d) => ({ ...d, open: false }));

  const removeTag = (sectionKey: string, tagId: number) => {
    setData((prev) =>
      prev.map((s) => (s.key === sectionKey ? { ...s, tags: s.tags.filter((x) => x.id !== tagId) } : s)),
    );
  };

  const submit = () => {
    if (!name.trim()) return;
    let next: Section[];
    if (drawer.editing) {
      next = data.map((s) =>
        s.key === drawer.sectionKey
          ? { ...s, tags: s.tags.map((x) => (x.id === drawer.editing!.id ? { ...x, label: name.trim() } : x)) }
          : s,
      );
    } else {
      const maxId = data.reduce((m, s) => Math.max(m, ...s.tags.map((x) => x.id)), 0);
      next = data.map((s) =>
        s.key === drawer.sectionKey ? { ...s, tags: [...s.tags, { id: maxId + 1, label: name.trim() }] } : s,
      );
    }
    setData(next);
    closeDrawer();
    void baseDomain
      .save({ sections: next }, drawer.editing ? "编辑基础数据分类" : "新增基础数据分类")
      .then((ok) => {
        if (ok) showConfigToast(drawer.editing ? "分类已更新" : "分类已添加");
      });
  };

  return (
    <div>
      <AdminBreadcrumb items={getBreadcrumb("平台配置", "基础数据")} />

      <div className="bd-wrap">
        <div className="nv-notice bd-notice">
          <span className="nv-notice-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
          </span>
          <div className="nv-notice-body">
            <div className="nv-notice-title">须知</div>
            <div className="nv-notice-line">本页全部选项数据请慎重修改或删除，一经修改或删除会影响已有数据。</div>
          </div>
        </div>

        <div className="bd-group">
          {data.map((s, idx) => (
            <div className="bd-section" key={s.key} style={{ marginTop: idx === 0 ? 0 : SECTION_GAP }}>
              <div className="bd-section-inner">
                <div className="bd-section-title">{s.title}</div>
                <div className="bd-pills">
                  {s.tags.map((tag) => (
                    <span className="bd-pill" key={tag.id}>
                      <span className="bd-pill-arrow">&lt;</span>
                      <span className="bd-pill-name">
                        {tag.emoji ? <span className="bd-pill-emoji">{tag.emoji}</span> : null}
                        {tag.label}
                      </span>
                      <button
                        type="button"
                        className="bd-pill-edit"
                        title="编辑"
                        onClick={() => openEdit(s.key, tag)}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="bd-pill-del"
                        title="删除"
                        onClick={() => removeTag(s.key, tag.id)}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 6 6 18M6 6l12 12" />
                        </svg>
                      </button>
                      <span className="bd-pill-arrow">&gt;</span>
                    </span>
                  ))}
                  <button type="button" className="bd-add-btn" onClick={() => openAdd(s.key)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                    添加分类
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {drawer.open && (
        <div className="app-modal-mask" onClick={closeDrawer}>
          <div className="app-modal bd-modal" onClick={(e) => e.stopPropagation()}>
            <div className="app-modal-header">
              <button type="button" className="app-modal-close" onClick={closeDrawer}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
              <span className="app-modal-title">添加分类</span>
              <div className="bd-modal-actions">
                <button type="button" className="bd-modal-cancel" onClick={closeDrawer}>取消</button>
                <button type="button" className="bd-modal-ok" onClick={submit}>确定提交</button>
              </div>
            </div>
            <div className="app-modal-body">
              <div className="bd-form">
                <div className="bd-form-row">
                  <label className="bd-form-label">
                    <span className="bd-req">*</span> 分类名称
                  </label>
                  <input
                    className="bd-input"
                    placeholder="请输入分类名称"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="bd-form-row">
                  <label className="bd-form-label">模板内容</label>
                  <textarea
                    className="bd-textarea"
                    placeholder="请输入"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                </div>
                <div className="bd-form-row bd-form-icon-row">
                  <label className="bd-form-label">分类图标</label>
                  <div className="bd-icon-group">
                    <div className="bd-icon-upload">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                      +40*40
                    </div>
                    <button type="button" className="bd-icon-cloud">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 16V8a3 3 0 0 1 3-3h1l2-3h4l2 3h1a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3z" />
                      </svg>
                      从云端素材选择
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
