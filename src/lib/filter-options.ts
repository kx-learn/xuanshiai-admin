/**
 * 原站（www.xuanshiai.com/admin）筛选项基准 — 静态枚举类
 *
 * 数据来源：.workbuddy/refsite/filters_report.md（原站前端 bundle 静态逆向）
 *
 * 只收「固定枚举」：两边都不随业务数据变化的选项。
 * 门店、红娘、分成事件这类由接口下发的动态列表不放在这里，见文件末尾 COMMISSION_EVENT_SEED。
 */

/** 相亲状态（会员/线索通用） */
export const XIANGQIN_STATUS = ["公开相亲", "委托红娘", "完全私密", "停止相亲", "已经脱单"] as const;

/** 相亲状态（原站部分页面用「关闭相亲」而非「停止相亲」） */
export const XIANGQIN_STATUS_CLOSE = ["公开相亲", "委托红娘", "完全私密", "关闭相亲", "已经脱单"] as const;

/** 会员登记来源 */
export const MEMBER_SOURCE = [
  "后台添加",
  "红娘录入",
  "批量导入",
  "自己注册",
  "落地页",
  "父母登记",
  "线索入库",
  "活动入库",
  "找搭子",
] as const;

/** 实名状态 */
export const REALNAME_STATUS = ["已实名", "未实名"] as const;

/** 资料审核状态 */
export const AUDIT_STATUS = ["待审核", "未通过", "已通过", "已到店核验"] as const;

/** 身份认证状态 */
export const CERT_STATUS = ["未认证", "已认证", "待审核", "认证失败"] as const;

/** 合同签署状态 */
export const SIGN_STATUS = ["未签署", "已签署", "签署失败"] as const;

/** 证件/户籍地区 */
export const REGION_TYPE = ["中国大陆", "港澳台", "国外"] as const;

/** 性别 */
export const GENDER = ["男", "女"] as const;

/** 会员资料页排序方式 */
export const MEMBER_SORT = [
  "排序：注册时间",
  "排序：录入时间",
  "排序：登录时间",
  "排序：跟进时间",
  "排序：分派时间",
  "排序：捞取时间",
] as const;

/** 通用搜索方式 */
export const SEARCH_TYPE = [
  "智能搜索",
  "按手机搜",
  "按微信搜",
  "按编号搜",
  "按ID搜",
  "按昵称搜",
  "按姓名搜",
] as const;

/** 客户意向（user_profile.intention_level：1低 2中 3高） */
export const INTENTION_LEVEL = ["低意向", "中意向", "高意向"] as const;

/** 婚况（users.is_married：0未知 1未婚 2离异 3丧偶） */
export const MARRIAGE_STATUS = ["未婚", "离异", "丧偶"] as const;

/** 学历（user_auth.education 原值） */
export const EDUCATION = ["高中", "大专", "本科", "硕士", "博士"] as const;

/** 年龄区间（映射到 age_min / age_max） */
export const AGE_RANGE = ["18-25岁", "26-35岁", "36-45岁", "46-55岁", "55岁以上"] as const;

/** 身高区间（映射到 height_min / height_max） */
export const HEIGHT_RANGE = ["150-160cm", "160-170cm", "170-180cm", "180-190cm", "190cm以上"] as const;

/** 收入区间（映射到 income_min / income_max） */
export const INCOME_RANGE = ["3000以下", "3000-8000", "8000-15000", "15000以上"] as const;

/** 会员级别（users.level 原值） */
export const MEMBER_LEVEL = ["普通会员", "VIP"] as const;

/** 超 N 天未跟进（分派配置） */
export const OVERDUE_FOLLOW_DAYS = [
  "超3天未跟进",
  "超7天未跟进",
  "超15天未跟进",
  "超30天未跟进",
  "超45天未跟进",
  "超60天未跟进",
  "超90天未跟进",
] as const;

/** 分派规则（分派配置） */
export const APPORTION_RULE = [
  "不启用",
  "统一分派给指定服务红娘",
  "循环随机分派给所有服务红娘(前台展示且非锁定状态)",
] as const;

/** 退款方式 */
export const REFUND_METHOD = ["原路退回", "退至余额"] as const;

/** 红娘角色 */
export const MATCHMAKER_ROLE = [
  "总店-超级红娘",
  "总店-普通红娘",
  "分店-店长红娘",
  "分店-普通红娘",
] as const;

/** 线上行为类型（会员资料 - 线上行为 Tab） */
export const BEHAVIOR_TYPE = [
  "浏览过谁",
  "被谁浏览",
  "收藏了谁",
  "给谁爆灯",
  "谁给Ta爆灯",
  "赠送礼物",
  "收到礼物",
] as const;

/** 线索落户方式 */
export const ACCOUNT_BIND_MODE = ["绑定已有账号", "自动生成账号", "自定义创建"] as const;

/** 记录排序 */
export const RECORD_ORDER = ["最新记录显示在前面", "最早记录显示在前面"] as const;

/** 行为记录排序（会员资料 - 线上行为 Tab） */
export const BEHAVIOR_SORT = ["最新记录显示在前面", "最早记录显示在前面", "智能匹配"] as const;

/** 加微信结果（会员资料） */
export const WECHAT_ADDED_STATUS = ["未添加", "已加上", "没加上"] as const;

/** 平台账号状态（账号管理） */
export const ACCOUNT_STATUS = ["待处理", "已取消", "已注销"] as const;

/** 属相 */
export const ZODIAC = ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"] as const;

/** 星座 */
export const CONSTELLATION = [
  "未知",
  "魔羯座",
  "水瓶座",
  "双鱼座",
  "白羊座",
  "金牛座",
  "双子座",
  "巨蟹座",
  "狮子座",
  "处女座",
  "天秤座",
  "天蝎座",
  "射手座",
] as const;

/** 自由表单字段类型 */
export const FORM_FIELD_TYPE = [
  "单行填写文本",
  "多行填写文本",
  "排列单项选择",
  "排列多项选择",
  "日期选择(年月日)",
  "多图片上传(最多9张)",
] as const;

/** 模板消息分类 */
export const WECHAT_TEMPLATE_CATEGORY = ["全部分类", "会员", "活动", "相亲", "短视频", "后台"] as const;

/** 积分明细 — 会员范围 */
export const CREDIT_MEMBER_SCOPE = [
  "所有实名认证会员",
  "所有相亲会员",
  "所有相亲女会员",
  "所有相亲男会员",
  "所有线上VIP会员",
] as const;

/** 积分明细 — 操作来源 */
export const CREDIT_ACTION_SOURCE = ["管理员操作"] as const;

/** 自由收款 — 搜索方式 */
export const PAY_SEARCH_TYPE = ["按会员昵称", "按手机号", "按订单号"] as const;

/** 线下VIP — 服务状态 */
export const VIP_SERVICE_STATUS = ["不限", "服务期内", "已过期", "无退费风险"] as const;

/** 线下VIP — 统计/排序维度 */
export const VIP_STAT_DIMENSION = [
  "会员最近一次付费",
  "会员的历史付费",
  "月度销售额",
  "年度销售额",
  "每月销冠",
] as const;

/** 线下VIP — 跟进 Tab */
export const VIP_FOLLOW_TAB = ["VIP服务跟进", "销售跟进历史", "通话记录"] as const;

/** 通用搜索方式（编号 / 手机） */
export const SEARCH_BY_PHONE_OR_ID = ["按手机搜", "按编号搜"] as const;

/** 门店启用状态 */
export const STORE_ENABLED = ["启用", "不启用"] as const;

/** 内容单页 — 二维码类型 */
export const QRCODE_TYPE = ["普通H5二维码", "引导关注公众号"] as const;

/** 分站配置 — 链接类型 */
export const BRANCH_LINK_TYPE = ["系统内置默认", "自定义链接"] as const;

/**
 * 分成/消费事件 —— 原站清单。
 * 注意：这类是后台业务数据（由 /admin/.../events 之类接口下发），前端不应硬编码。
 * 这里只作为「后端需要补齐的事件种子数据」留档，页面请继续用接口返回的 options.events。
 */
export const COMMISSION_EVENT_SEED = [
  "资料审核费(男)",
  "资料审核费(女)",
  "资料推广",
  "资料置顶",
  "牵线套餐",
  "单次牵线",
  "VIP会员",
  "会员爆灯",
  "活动报名",
  "互选活动报名",
  "社群缴费",
  "商品销售",
  "线上收款",
  "推广红娘入伙",
] as const;

/* ────────────────────────────────────────────────────────────────────────────
 * 中文选项文案 → 后端参数值
 *
 * 上面的常量是「给人看的文案」，下面这些是「给接口的值」。两者的顺序并不总是一致
 * （例如 CERT_STATUS 的 0/1/2/3 对应 未认证/已认证/待审核/认证失败，而文案顺序
 * 恰好错开），所以**不要**用 index 当枚举值，一律查表。
 *
 * 取值口径来自后端：
 * - 会员资料 `app/services/member_crm_filter.py`（SEARCH_TYPE_SQL / BEHAVIOR_TYPE_SQL /
 *   SORT_SQL / ORDER_SQL / REGION_VALUES）
 * - 各路由的 `Query(..., pattern=...)` 与 description
 * ──────────────────────────────────────────────────────────────────────────── */

/** 相亲状态：1公开相亲 2委托红娘 3完全私密 4停止相亲/关闭相亲 5已经脱单 */
export const XIANGQIN_STATUS_VALUE: Record<string, number> = {
  公开相亲: 1,
  委托红娘: 2,
  完全私密: 3,
  停止相亲: 4,
  关闭相亲: 4,
  已经脱单: 5,
};

/** 证件/户籍地区 → users.region */
export const REGION_TYPE_VALUE: Record<string, string> = {
  中国大陆: "mainland",
  港澳台: "hmt",
  国外: "overseas",
};

/** 身份认证状态 → users.cert_status（注意与文案顺序不同） */
export const CERT_STATUS_VALUE: Record<string, number> = {
  未认证: 0,
  已认证: 1,
  待审核: 2,
  认证失败: 3,
};

/** 加微信结果 → users.wechat_added */
export const WECHAT_ADDED_VALUE: Record<string, number> = {
  未添加: 0,
  已加上: 1,
  没加上: 2,
};

/** 线上行为类型 → EXISTS 谓词分支 */
export const BEHAVIOR_TYPE_VALUE: Record<string, string> = {
  浏览过谁: "viewed",
  被谁浏览: "viewed_by",
  收藏了谁: "favorited",
  给谁爆灯: "boosted",
  "谁给Ta爆灯": "boosted_by",
  赠送礼物: "gift_sent",
  收到礼物: "gift_received",
};

/** 记录排序 → order（与 sort_by 互斥，同时传时后端以 order 为准） */
export const RECORD_ORDER_VALUE: Record<string, string> = {
  最新记录显示在前面: "latest",
  最早记录显示在前面: "earliest",
  智能匹配: "smart",
};

/** 客户意向 → user_profile.intention_level（列注释：1低 2中 3高） */
export const INTENTION_LEVEL_VALUE: Record<string, number> = {
  低意向: 1,
  中意向: 2,
  高意向: 3,
};

/** 婚况 → users.is_married（列注释：0未知 1未婚 2离异 3丧偶） */
export const MARRIAGE_STATUS_VALUE: Record<string, number> = {
  未婚: 1,
  离异: 2,
  丧偶: 3,
};

/** 实名状态 → realname（后端 Boolean：true 已实名 / false 未实名） */
export const REALNAME_STATUS_VALUE: Record<string, boolean> = {
  已实名: true,
  未实名: false,
};

/** 线下VIP / 置顶推广 / 新人推荐 / 活动报名 → 同名 Boolean 参数 */
export const BOOLEAN_FILTER_VALUE: Record<string, boolean> = {
  是: true,
  不是: false,
  已报名: true,
  未报名: false,
  推荐中: true,
  置顶中: true,
  未置顶: false,
};

/** 搜索方式 → search_type（与后端 SEARCH_TYPE_SQL 的键一一对应） */
export const SEARCH_TYPE_VALUE: Record<string, string> = {
  智能搜索: "smart",
  按手机搜: "phone",
  按微信搜: "wechat",
  按编号搜: "code",
  按ID搜: "id",
  按昵称搜: "nickname",
  按姓名搜: "realname",
};

/** 年龄区间文案 → [age_min, age_max] */
export const AGE_RANGE_VALUE: Record<string, [number, number | null]> = {
  "18-25岁": [18, 25],
  "26-35岁": [26, 35],
  "36-45岁": [36, 45],
  "46-55岁": [46, 55],
  "55岁以上": [56, null],
};

/** 身高区间文案 → [height_min, height_max] */
export const HEIGHT_RANGE_VALUE: Record<string, [number, number | null]> = {
  "150-160cm": [150, 160],
  "160-170cm": [160, 170],
  "170-180cm": [170, 180],
  "180-190cm": [180, 190],
  "190cm以上": [191, null],
};

/** 收入区间文案 → [income_min, income_max] */
export const INCOME_RANGE_VALUE: Record<string, [number | null, number | null]> = {
  "3000以下": [null, 3000],
  "3000-8000": [3000, 8000],
  "8000-15000": [8000, 15000],
  "15000以上": [15000, null],
};

/** 线索落户方式 → bind_mode */
export const ACCOUNT_BIND_MODE_VALUE: Record<string, string> = {
  绑定已有账号: "bind",
  自动生成账号: "auto",
  自定义创建: "custom",
};

/** 内容单页二维码类型 → qrcode_type（取自 extra.qrcode_type） */
export const QRCODE_TYPE_VALUE: Record<string, string> = {
  普通H5二维码: "h5",
  引导关注公众号: "follow",
};

/** 自由收款订单搜索方式 → search_type */
export const PAY_SEARCH_TYPE_VALUE: Record<string, string> = {
  按会员昵称: "nickname",
  按手机号: "phone",
  按订单号: "order_no",
};

/** 积分明细 — 会员范围 → member_scope */
export const CREDIT_MEMBER_SCOPE_VALUE: Record<string, string> = {
  所有实名认证会员: "verified",
  所有相亲会员: "xiangqin",
  所有相亲女会员: "xiangqin_female",
  所有相亲男会员: "xiangqin_male",
  所有线上VIP会员: "online_vip",
};

/** 积分明细 — 操作来源 → action_source（后端当前仅支持 admin） */
export const CREDIT_ACTION_SOURCE_VALUE: Record<string, string> = {
  管理员操作: "admin",
};

/** 积分明细 — 积分类别 → category */
export const CREDIT_CATEGORY = ["积分充值", "礼品兑换", "收礼物奖励", "送礼物"] as const;
export const CREDIT_CATEGORY_VALUE: Record<string, string> = {
  积分充值: "recharge",
  礼品兑换: "gift_exchange",
  收礼物奖励: "gift_received",
  送礼物: "gift_sent",
};

/** 线下VIP — 服务状态 → service_status（与 progress 服务进度是两套维度） */
export const VIP_SERVICE_STATUS_VALUE: Record<
  string,
  "active" | "expired" | "no_refund_risk"
> = {
  服务期内: "active",
  已过期: "expired",
  无退费风险: "no_refund_risk",
};
