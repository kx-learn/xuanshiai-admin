# -*- coding: utf-8 -*-
"""Generate all remaining admin pages (ContentCrud / ConfigForm / special tabs)."""
import os, json

BASE = r"E:\HTML\xuanshiai-admin\src\app\(admin)"

CRUD_HEADER = '''"use client";

import ContentCrud from "@/components/ContentCrud";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
'''

def crud_page(menu, title, domain, columns, fields, add_label=None, read_only=False, notice=None):
    add_label = add_label or ("查看" if read_only else "新增")
    lines = [CRUD_HEADER]
    lines.append(f'const breadcrumb = getBreadcrumb("{menu}", "{title}");')
    lines.append("")
    lines.append(f'export default function Page() {{')
    lines.append('  return (')
    lines.append('    <ContentCrud')
    lines.append('      breadcrumb={breadcrumb}')
    lines.append(f'      pageTitle="{title}"')
    lines.append(f'      domain="{domain}"')
    lines.append('      columns={[')
    for c in columns:
        lines.append(f'        {{ title: "{c[0]}", key: "{c[1]}" }},')
    lines.append('      ]}')
    lines.append('      fields={[')
    for f in fields:
        req = "true" if f.get("required") else "false"
        lines.append(f'        {{ key: "{f["key"]}", label: "{f["label"]}", type: "{f["type"]}", required: {req} }},')
    lines.append('      ]}')
    if fields:
        lines.append(f'      addLabel="{add_label}"')
    if read_only:
        lines.append('      readOnly')
    lines.append('    />')
    lines.append('  );')
    lines.append('}')
    return "\n".join(lines)

def config_page(menu, title, namespace, defaults, sections):
    L = []
    L.append('"use client";')
    L.append('')
    L.append('import ConfigForm from "@/components/ConfigForm";')
    L.append('import { getBreadcrumb } from "@/lib/breadcrumb-config";')
    L.append('')
    L.append('const breadcrumb = getBreadcrumb("%s", "%s");' % (menu, title))
    L.append('')
    L.append('const DEFAULTS = ' + json.dumps(defaults, ensure_ascii=False, indent=2) + ';')
    L.append('')
    L.append('export default function Page() {')
    L.append('  return (')
    L.append('    <ConfigForm')
    L.append('      breadcrumb={breadcrumb}')
    L.append('      namespace="%s"' % namespace)
    L.append('      name="%s"' % title)
    L.append('      defaults={DEFAULTS}')
    L.append('      sections={[ {')
    for sec in sections:
        L.append('        title: "%s",' % sec["title"])
        L.append('        fields: [')
        for f in sec["fields"]:
            extra = ""
            if f.get("itemFields"):
                ifs = ", ".join('{ key: "%s", label: "%s", type: "%s" }' % (i["key"], i["label"], i["type"]) for i in f["itemFields"])
                extra = ", itemFields: [%s]" % ifs
            L.append('          { key: "%s", label: "%s", type: "%s"%s },' % (f["key"], f["label"], f["type"], extra))
        L.append('        ],')
        L.append('      }, {') if sec is not sections[-1] else L.append('      }')
    L.append('      ]}')
    L.append('    />')
    L.append('  );')
    L.append('}')
    return "\n".join(L)

def write(slug, content):
    d = os.path.join(BASE, slug)
    os.makedirs(d, exist_ok=True)
    with open(os.path.join(d, "page.tsx"), "w", encoding="utf-8", newline="\n") as fh:
        fh.write(content)
    print("wrote", slug)

# ============ CRUD 页 ============
CRUDS = [
    ("active-list", "活动报名", "活动管理", "activity", False, "发布活动",
     [("名称","title"),("地点","subtitle"),("报名费","amount"),("状态","status"),("创建时间","created_at")],
     [{"key":"title","label":"活动名称","type":"text","required":True},{"key":"subtitle","label":"活动地点","type":"text"},{"key":"image","label":"活动封面","type":"image"},{"key":"amount","label":"报名费(元)","type":"number"},{"key":"detail","label":"活动详情","type":"textarea"}]),
    ("active-signupmanager", "活动报名", "报名管理", "activity_signup", False, "添加报名",
     [("活动名称","title"),("报名人","name"),("手机号","phone"),("报名时间","created_at"),("状态","status")],
     [{"key":"title","label":"活动名称","type":"text","required":True},{"key":"name","label":"报名人","type":"text","required":True},{"key":"phone","label":"手机号","type":"text"},{"key":"remark","label":"备注","type":"textarea"}]),
    ("mutual-selection-activities-list", "活动报名", "互选活动管理", "mutual_activity", False, "创建活动",
     [("名称","title"),("地点","subtitle"),("状态","status"),("创建时间","created_at")],
     [{"key":"title","label":"活动名称","type":"text","required":True},{"key":"subtitle","label":"活动地点","type":"text"},{"key":"image","label":"活动图标","type":"image"},{"key":"detail","label":"活动说明","type":"textarea"}]),
    ("mutual-selection-activities-record", "活动报名", "互选记录", "mutual_signup", False, "录入互选",
     [("活动","title"),("会员A","name"),("会员B","other"),("时间","created_at"),("状态","status")],
     [{"key":"title","label":"活动名称","type":"text","required":True},{"key":"name","label":"会员A","type":"text","required":True},{"key":"other","label":"会员B","type":"text","required":True},{"key":"remark","label":"备注","type":"textarea"}]),
    ("merchant-management", "商家联盟", "商家管理", "merchant", False, "添加商家",
     [("商家名称","title"),("联系方式","subtitle"),("商家图","image_url"),("状态","status"),("创建时间","created_at")],
     [{"key":"title","label":"商家名称","type":"text","required":True},{"key":"subtitle","label":"联系方式","type":"text"},{"key":"image","label":"商家图(300*300)","type":"image"},{"key":"detail","label":"商家介绍","type":"textarea"}]),
    ("merchant-product", "商家联盟", "商品管理", "merchant_product", False, "添加商品",
     [("商品名称","title"),("原价值","amount"),("合作优惠价","price"),("状态","status"),("创建时间","created_at")],
     [{"key":"title","label":"商品名称","type":"text","required":True},{"key":"amount","label":"原价值(元)","type":"number"},{"key":"price","label":"合作优惠价(元)","type":"number"},{"key":"image","label":"商品图(800*800)","type":"image"},{"key":"detail","label":"商品介绍","type":"textarea"}]),
    ("merchant-order", "商家联盟", "订单管理", "merchant_order", True, "查看",
     [("商品","title"),("购买人","buyer"),("金额","amount"),("下单时间","created_at"),("状态","status")], []),
    ("short-video-list", "短视频", "视频管理", "short_video", False, "添加视频",
     [("标题","title"),("发布者","author"),("发布时间","created_at"),("状态","status")],
     [{"key":"title","label":"视频标题","type":"text","required":True},{"key":"author","label":"发布者","type":"text"},{"key":"video_url","label":"视频地址","type":"text"},{"key":"image","label":"封面图","type":"image"},{"key":"detail","label":"视频简介","type":"textarea"}]),
    ("short-video-red-packet", "短视频", "红包记录", "video_red_packet", True, "查看",
     [("视频","title"),("发红包人","sender"),("金额","amount"),("时间","created_at")], []),
    ("short-video-comment", "短视频", "评论管理", "video_comment", False, "添加评论",
     [("评论内容","title"),("评论人","author"),("时间","created_at"),("状态","status")],
     [{"key":"title","label":"评论内容","type":"textarea","required":True},{"key":"author","label":"评论人","type":"text","required":True}]),
    ("short-video-homepage", "短视频", "会员主页", "video_homepage", False, "添加主页",
     [("会员昵称","title"),("粉丝数","fans"),("创建时间","created_at"),("状态","status")],
     [{"key":"title","label":"会员昵称","type":"text","required":True},{"key":"image","label":"头像","type":"image"},{"key":"detail","label":"主页简介","type":"textarea"}]),
    ("short-video-tip", "短视频", "打赏管理", "video_tip", True, "查看",
     [("视频","title"),("打赏人","from_user"),("金额","amount"),("时间","created_at")], []),
    ("sales-library", "运营工具", "销售匹配库", "sales_library", False, "创建销售匹配库",
     [("库名称","title"),("选人上限","max_select"),("创建时间","created_at"),("状态","status")],
     [{"key":"title","label":"库名称","type":"text","required":True},{"key":"max_select","label":"选人上限","type":"number"},{"key":"detail","label":"库说明","type":"textarea"}]),
    ("single-page", "运营工具", "内容单页", "single_page", False, "添加单页",
     [("页面标题","title"),("创建时间","created_at"),("状态","status")],
     [{"key":"title","label":"页面标题","type":"text","required":True},{"key":"content","label":"页面正文","type":"textarea"},{"key":"image","label":"封面图","type":"image"}]),
    ("customer-landing", "运营工具", "落地页", "landing_page", False, "创建落地页",
     [("落地页名称","title"),("创建时间","created_at"),("状态","status")],
     [{"key":"title","label":"落地页名称","type":"text","required":True},{"key":"content","label":"落地页内容","type":"textarea"},{"key":"image","label":"头图","type":"image"}]),
    ("free-form", "运营工具", "自由表单", "free_form", False, "添加表单",
     [("表单名称","title"),("创建时间","created_at"),("状态","status")],
     [{"key":"title","label":"表单名称","type":"text","required":True},{"key":"fields_json","label":"表单字段(名称用逗号分隔)","type":"textarea"}]),
    ("tool-lovecard", "运营工具", "批量资料卡", "lovecard_batch", False, "新建批量生成",
     [("任务名称","title"),("创建时间","created_at"),("状态","status")],
     [{"key":"title","label":"任务名称","type":"text","required":True},{"key":"content","label":"资料卡内容","type":"textarea"},{"key":"image","label":"模版图","type":"image"}]),
    ("qrcode-wrap", "运营工具", "吸粉二维码", "fan_qrcode", False, "添加二维码",
     [("名称","title"),("到期时间","expire"),("创建时间","created_at"),("状态","status")],
     [{"key":"title","label":"二维码名称","type":"text","required":True},{"key":"image","label":"二维码图片","type":"image"},{"key":"expire","label":"到期时间","type":"text"}]),
    ("gift-list", "运营工具", "礼品管理", "gift", False, "添加礼品",
     [("礼品名称","title"),("所需积分","amount"),("库存","stock"),("状态","status")],
     [{"key":"title","label":"礼品名称","type":"text","required":True},{"key":"amount","label":"所需积分","type":"number"},{"key":"stock","label":"库存","type":"number"},{"key":"image","label":"礼品图","type":"image"},{"key":"detail","label":"礼品介绍","type":"textarea"}]),
    ("gift-exchange", "运营工具", "兑换管理", "gift_exchange", True, "查看",
     [("礼品","title"),("兑换人","user"),("兑换时间","created_at"),("状态","status")], []),
    ("branch-matchmaker-list", "分店管理", "分店红娘", "branch_matchmaker", False, "添加红娘",
     [("红娘姓名","title"),("所属分店","store"),("手机号","phone"),("状态","status")],
     [{"key":"title","label":"红娘姓名","type":"text","required":True},{"key":"store","label":"所属分店","type":"text"},{"key":"phone","label":"手机号","type":"text"},{"key":"detail","label":"备注","type":"textarea"}]),
    ("branch-report-list", "分店管理", "分店报表", "branch_report", True, "查看",
     [("分店","title"),("订单数","order_count"),("订单额","order_amount"),("分成金额","commission"),("日期","created_at")], []),
    ("branch-distribuion-list", "分店管理", "分成明细", "branch_distribution", True, "查看",
     [("分店","title"),("分成金额","amount"),("关联订单","order"),("时间","created_at")], []),
    ("love-partner-list", "合伙红娘", "合伙人管理", "partner", False, "添加合伙人",
     [("姓名","title"),("手机号","phone"),("所属团队","team"),("累计收益","amount"),("状态","status")],
     [{"key":"title","label":"姓名","type":"text","required":True},{"key":"phone","label":"手机号","type":"text"},{"key":"team","label":"所属团队","type":"text"},{"key":"amount","label":"累计收益(元)","type":"number"},{"key":"detail","label":"备注","type":"textarea"}]),
    ("love-partner-relation-manage", "合伙红娘", "团队关系", "partner_relation", False, "添加团队",
     [("团队名称","title"),("队长","leader"),("创建时间","created_at"),("状态","status")],
     [{"key":"title","label":"团队名称","type":"text","required":True},{"key":"leader","label":"队长","type":"text","required":True},{"key":"detail","label":"团队成员(逗号分隔)","type":"textarea"}]),
    ("love-partner-bonus-details", "合伙红娘", "分成明细", "partner_bonus_detail", False, "录入分成",
     [("合伙人","title"),("分成金额","amount"),("关联订单","order"),("时间","created_at")],
     [{"key":"title","label":"合伙人","type":"text","required":True},{"key":"amount","label":"分成金额(元)","type":"number"},{"key":"order","label":"关联订单","type":"text"}]),
    ("poplove-matchmaker-distribution-details", "推广红娘", "分成明细", "promoter_distribution", False, "录入一笔分成",
     [("推广红娘","title"),("分成金额","amount"),("关联订单","order"),("时间","created_at")],
     [{"key":"title","label":"推广红娘","type":"text","required":True},{"key":"amount","label":"分成金额(元)","type":"number"},{"key":"order","label":"关联订单","type":"text"}]),
    ("good-news-manage", "运营工具", "喜讯管理", "good_news", False, "添加喜讯",
     [("会员昵称","title"),("喜讯分类","category"),("照片","image_url"),("时间","created_at"),("状态","status")],
     [{"key":"title","label":"会员昵称","type":"text","required":True},{"key":"category","label":"喜讯分类","type":"text"},{"key":"content","label":"喜讯内容","type":"textarea"},{"key":"image","label":"照片","type":"image"}]),
    ("good-news-pennant-manage", "运营工具", "锦旗管理", "good_news_pennant", False, "添加锦旗",
     [("赠送人","title"),("赠给","to_user"),("锦旗内容","content"),("时间","created_at"),("状态","status")],
     [{"key":"title","label":"赠送人","type":"text","required":True},{"key":"to_user","label":"赠给","type":"text"},{"key":"content","label":"锦旗内容","type":"textarea"},{"key":"image","label":"锦旗图片","type":"image"}]),
    ("group-manage", "运营工具", "社群管理", "community_group", False, "添加社群",
     [("社群名称","title"),("群主","owner"),("成员数","members"),("状态","status")],
     [{"key":"title","label":"社群名称","type":"text","required":True},{"key":"owner","label":"群主","type":"text"},{"key":"detail","label":"社群简介","type":"textarea"}]),
    ("sign-manage", "运营工具", "报名管理", "group_signup", False, "添加报名",
     [("社群","title"),("报名人","name"),("手机号","phone"),("报名时间","created_at"),("状态","status")],
     [{"key":"title","label":"社群名称","type":"text","required":True},{"key":"name","label":"报名人","type":"text","required":True},{"key":"phone","label":"手机号","type":"text"}]),
    ("interactive-messages-list", "运营工具", "消息记录", "interactive_message", True, "查看",
     [("消息类型","title"),("发送者","from_user"),("接收者","to_user"),("时间","created_at"),("状态","status")], []),
    ("vip-popularize-record", "会员CRM", "推广管理", "popularize_record", False, "录入推广",
     [("会员","title"),("推广渠道","channel"),("奖励金额","amount"),("时间","created_at"),("状态","status")],
     [{"key":"title","label":"会员","type":"text","required":True},{"key":"channel","label":"推广渠道","type":"text"},{"key":"amount","label":"奖励金额(元)","type":"number"}]),
]

for slug, menu, title, domain, ro, add, cols, flds in CRUDS:
    write(slug, crud_page(menu, title, domain, cols, flds, add_label=add, read_only=ro))

# ============ 配置页 ============
CONFIGS = [
    ("active-config", "活动报名", "参数配置", "tools_active",
     {"categories": ["专场活动","会面小聚","相亲大会","政企联谊","免费活动"], "banner_url": None, "signup_tip": "线下活动规则", "allow_cancel": True, "max_signups_per_user": 1},
     [{"title":"活动分类","fields":[{"key":"categories","label":"分类标签","type":"tags"}]},
      {"title":"参数配置","fields":[{"key":"banner_url","label":"活动宣传图","type":"image","hint":"最佳尺寸：900×383"},{"key":"signup_tip","label":"用户协议须知","type":"html"},{"key":"allow_cancel","label":"允许用户取消报名","type":"switch"},{"key":"max_signups_per_user","label":"每人限报活动数","type":"number"}]}]),
    ("active-alliance", "活动报名", "运营方案", "tools_active_alliance",
     {"content_html": "", "enabled": True},
     [{"title":"运营方案内容","fields":[{"key":"enabled","label":"启用","type":"switch"},{"key":"content_html","label":"方案正文","type":"html"}]}]),
    ("merchant-alliance-config", "商家联盟", "功能配置", "tools_merchant_alliance",
     {"categories": [], "enabled": True, "join_tip": ""},
     [{"title":"功能配置","fields":[{"key":"enabled","label":"启用商家联盟","type":"switch"},{"key":"categories","label":"商品分类","type":"tags"},{"key":"join_tip","label":"入驻说明","type":"html"}]}]),
    ("short-video-config", "短视频", "参数配置", "tools_short_video",
     {"red_packet_enabled": True, "comment_enabled": True, "tip_enabled": True, "publish_review": False, "banner_url": None, "daily_publish_limit": 5},
     [{"title":"功能开关","fields":[{"key":"red_packet_enabled","label":"视频红包","type":"switch"},{"key":"comment_enabled","label":"评论区","type":"switch"},{"key":"tip_enabled","label":"打赏","type":"switch"},{"key":"publish_review","label":"发布需审核","type":"switch"}]},
      {"title":"展示参数","fields":[{"key":"banner_url","label":"栏目头图","type":"image"},{"key":"daily_publish_limit","label":"每日发布上限","type":"number"}]}]),
    ("love-partner-config", "合伙红娘", "功能配置", "tools_love_partner",
     {"content_html": "", "enabled": True, "apply_tip": ""},
     [{"title":"功能配置","fields":[{"key":"enabled","label":"启用合伙红娘","type":"switch"},{"key":"apply_tip","label":"加盟须知","type":"textarea"},{"key":"content_html","label":"合作说明(富文本)","type":"html"}]}]),
    ("love-partner-bonus-config", "合伙红娘", "分成配置", "tools_partner_bonus",
     {"mode": "ratio", "default_ratio": 0, "levels": []},
     [{"title":"分成规则","fields":[{"key":"mode","label":"分成模式(ratio/amount)","type":"text"},{"key":"default_ratio","label":"默认分成比例(%)","type":"number"},{"key":"levels","label":"分成级别","type":"objects","itemFields":[{"key":"name","label":"级别名","type":"text"},{"key":"ratio","label":"比例(%)","type":"number"},{"key":"reward","label":"额外奖励(元)","type":"number"}]}]}]),
    ("love-customer-config", "客源线索", "功能配置", "tools_customer_leads",
     {"auto_assign": False, "protect_days": 30, "follow_up_tip": "", "abandon_days": 15, "daily_new_limit": 10},
     [{"title":"分配规则","fields":[{"key":"auto_assign","label":"新客源自动分配","type":"switch"},{"key":"daily_new_limit","label":"每人每日新客源上限","type":"number"}]},
      {"title":"跟进与保护","fields":[{"key":"protect_days","label":"客源保护天数","type":"number"},{"key":"abandon_days","label":"未跟进自动弃海(天)","type":"number"},{"key":"follow_up_tip","label":"跟进要求说明","type":"textarea"}]}]),
    ("interactive-messages-function", "运营工具", "互动消息功能设置", "tools_interactive_function",
     {"like_enabled": True, "greet_enabled": True, "gift_notice_enabled": True, "daily_push_limit": 20, "quiet_hours": ""},
     [{"title":"消息开关","fields":[{"key":"like_enabled","label":"点赞通知","type":"switch"},{"key":"greet_enabled","label":"打招呼通知","type":"switch"},{"key":"gift_notice_enabled","label":"礼物通知","type":"switch"}]},
      {"title":"频率控制","fields":[{"key":"daily_push_limit","label":"每日推送上限","type":"number"},{"key":"quiet_hours","label":"免打扰时段(如 22:00-08:00)","type":"text"}]}]),
    ("interactive-messages-content", "运营工具", "互动消息内容设置", "tools_interactive_content",
     {"templates": []},
     [{"title":"消息文案模板","fields":[{"key":"templates","label":"模板列表","type":"objects","itemFields":[{"key":"name","label":"模板名","type":"text"},{"key":"content","label":"文案内容","type":"text"}]}]}]),
    ("column-configuration", "运营工具", "搭子社群栏目配置", "tools_column_config",
     {"title": "搭子社群", "description": "兴趣搭子、活动搭子，找同频的人。", "share_cover_url": None, "categories": []},
     [{"title":"栏目设置","fields":[{"key":"title","label":"栏目标题","type":"text"},{"key":"description","label":"栏目描述","type":"textarea"},{"key":"share_cover_url","label":"分享封面(300*300)","type":"image"},{"key":"categories","label":"社群分类","type":"tags"}]}]),
    ("matchmaker-good-news-configuration", "运营工具", "红娘喜讯栏目配置", "tools_good_news",
     {"title": "红娘喜讯", "description": "Ta们都是在我们的介绍撮合下，从相识、到恋爱、到见父母、到订婚、到结婚生子！", "share_cover_mode": "default", "share_cover_url": None, "banner_url": None, "view_url": "/subpages/xixun/index", "categories": ["牵手成功","恋爱生活","已见父母","已订婚","已领证","已办婚礼","婚后生活","锦旗飘扬"], "category_icons": [], "blessings": []},
     [{"title":"栏目设置","fields":[{"key":"title","label":"栏目标题","type":"text"},{"key":"description","label":"栏目描述","type":"textarea"},{"key":"share_cover_url","label":"分享封面(300*300)","type":"image"},{"key":"banner_url","label":"宣传头图","type":"image","hint":"最佳尺寸：698像素x240像素"}]},
      {"title":"喜讯分类","fields":[{"key":"categories","label":"分类(按顺序展示)","type":"tags"}]},
      {"title":"祝福语管理","fields":[{"key":"blessings","label":"祝福语","type":"tags"}]}]),
]

for slug, menu, title, ns, defaults, sections in CONFIGS:
    write(slug, config_page(menu, title, ns, defaults, sections))

print("ALL GENERATED")
