import { adminApi, downloadAdminFile, getAdminToken } from "@/lib/admin-api";
import type { ConfigSnapshot, Dict } from "@/lib/platform-config";

export type PageQuery = { page?: number; page_size?: number; status?: number | string; keyword?: string };
export type ReviewPayload = { status?: number; reason?: string; result?: string; action?: string; hide_content?: boolean; restore_content?: boolean };
export type AdminListQuery = PageQuery & Record<string, string | number | undefined>;
export type JsonBody = Record<string, unknown>;
export type DashboardQuery = { from?: string; to?: string };

// ─── M4 客源线索 / 会员服务类型 ────────────────────────────────────
export interface CustomerLeadOption {
  value: string;
  label: string;
}
export interface CustomerLeadOptions {
  sources: CustomerLeadOption[];
  matchmakers: CustomerLeadOption[];
  promoters: CustomerLeadOption[];
  tags: CustomerLeadOption[];
}
export interface CustomerLeadImportSummary {
  created: number;
  skipped: number;
  failed: number;
  total: number;
  errors: string[];
}
export interface MeetingStatistics {
  total_arranged: number;
  total_met: number;
  month_arranged: number;
  month_waiting: number;
  month_met: number;
  month_not_met: number;
}
export interface MeetingDirectPayload {
  from_user_id: number;
  to_user_id: number;
  organizer_id: number;
  organization_id?: number;
  scheduled_at?: string;
  location?: string;
  member_visible: boolean;
  sms_remind: boolean;
  met: boolean;
}
export type PromotionPayStatus = "unpaid" | "paid" | "refunded";
export type PromotionOrderStatus = "pending" | "processing" | "done" | "cancelled";
export interface PromotionOrder {
  id: number;
  order_no: string;
  user_id: number;
  user_nickname: string | null;
  product_name: string;
  amount: string;
  pay_status: PromotionPayStatus;
  pay_method: string | null;
  status: PromotionOrderStatus;
  remark: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}
export interface PromotionOrderPage {
  items: PromotionOrder[];
  page: number;
  page_size: number;
  total: number;
  has_more: boolean;
}
export interface PromotionOrderStatistics {
  total: number;
  paid_count: number;
  paid_amount: string;
  processing_count: number;
}
export type PromotionOrderUpdatePayload = Partial<{
  pay_status: PromotionPayStatus;
  pay_method: string;
  status: PromotionOrderStatus;
  remark: string;
}>;

// ─── 服务红娘分成级别类型 ──────────────────────────────────────
export type CommissionLevelMode = "rate" | "fixed";

export interface CommissionLevel {
  id: number;
  code: string;
  name: string;
  mode: CommissionLevelMode;
  rate_percent: string;
  fixed_amount: string | null;
  platform_extra_amount: string;
  platform_extra_pay_mode: "manual" | "balance";
  promotion_condition: string | null;
  sort: number;
  status: 1 | 2;
  applicable_matchmaker_count: number;
  updated_by: number | null;
  created_at: string | null;
  updated_at: string | null;
}
export type CommissionLevelUpdatePayload = Partial<{
  "name": string;
  "mode": CommissionLevelMode;
  "rate_percent": string;
  "fixed_amount": string | null;
  "platform_extra_amount": string;
  "platform_extra_pay_mode": "manual" | "balance";
  "promotion_condition": string | null;
  "sort": number;
  "status": 1 | 2;
}>;

// ─── 红娘线上分成明细类型 ─────────────────────────────────────────
export interface CommissionEntryDetailItem {
  id: number;
  created_at: string;
  store_name: string;
  matchmaker_id: number;
  matchmaker_name: string;
  matchmaker_avatar: string | null;
  consumer_id: number;
  consumer_name: string;
  consumer_phone: string | null;
  consumer_avatar: string | null;
  event_name: string;
  beneficiary_type: string;
  order_id: number;
  order_no: string | null;
  consumer_amount: string;
  commission_amount: string;
  status: string;
}

export interface CommissionEntryDetailPage {
  items: CommissionEntryDetailItem[];
  page: number;
  page_size: number;
  total: number;
  has_more: boolean;
}

export interface CommissionEntryMatchmakerOption {
  id: number;
  name: string;
  avatar: string | null;
}

export interface CommissionEntryEventOption {
  id: number;
  name: string;
  beneficiary_type: string;
}

export interface CommissionEntryDetailOptions {
  matchmakers: CommissionEntryMatchmakerOption[];
  events: CommissionEntryEventOption[];
}

export type CommissionEntryListQuery = {
  page?: number;
  page_size?: number;
  matchmaker_id?: number;
  rule_id?: number;
  start_date?: string;
  end_date?: string;
};

// ─── 推广红娘管理类型 ─────────────────────────────────────────
export type PromoterMatchmakerType = "part_time" | "full_time";
export const PROMOTER_LEVELS: { id: 1 | 2 | 3 | 4; name: string }[] = [
  { id: 1, name: "初级" },
  { id: 2, name: "推广大师" },
  { id: 3, name: "推广大使" },
  { id: 4, name: "推广天使" },
];

export interface PromoterUserCandidate {
  id: number;
  nickname: string | null;
  phone: string | null;
  avatar: string | null;
}

export interface PromoterStaffItem {
  id: number;
  user_id: number;
  avatar: string | null;
  display_name: string;
  account: string | null;
  phone: string | null;
  channel: string | null;
  matchmaker_type: PromoterMatchmakerType | null;
  matchmaker_type_label: string | null;
  commission_level_id: number | null;
  commission_level_name: string | null;
  team_id: number | null;
  team_name: string | null;
  member_count: number;
  member_month: number;
  lead_total: number;
  lead_month: number;
  order_amount: string;
  touch_count: number;
  status: 1 | 2;
  status_label: string | null;
  visible: boolean;
  reviewed_at: string | null;
  intro: string | null;
  created_at: string | null;
}

export interface PromoterStaffPage {
  items: PromoterStaffItem[];
  page: number;
  page_size: number;
  total: number;
  has_more: boolean;
}

export interface PromoterStaffDetail extends PromoterStaffItem {
  real_name: string | null;
  suspension_reason: string | null;
  slogan: string | null;
  can_view_lead_follow: boolean;
  can_write_lead_follow: boolean;
  can_view_member_crm_follow: boolean;
}

export type PromoterListQuery = {
  page?: number;
  page_size?: number;
  keyword?: string;
  status?: 1 | 2;
  commission_level_id?: number;
  team_id?: number;
  visible?: boolean;
  sort?: "joined_desc" | "joined_asc" | "member_desc" | "member_asc";
};

export interface PromoterStatistics {
  part_time_count: number;
  full_time_count: number;
  member_total: number;
  member_month: number;
  member_last_month: number;
  lead_total: number;
  lead_month: number;
  lead_last_month: number;
}

export interface PromoterTeamItem {
  id: number;
  name: string;
  owner_user_id: number | null;
  owner_name: string | null;
  status: number | null;
}

export type PromoterCreatePayload = {
  user_id?: number;
  lookup?: string;
  lookup_by?: "nickname" | "phone";
  display_name: string;
  phone?: string | null;
  channel?: string | null;
  intro?: string | null;
  matchmaker_type?: PromoterMatchmakerType | null;
  slogan?: string | null;
  commission_level_id?: number | null;
  can_view_lead_follow?: boolean;
  can_write_lead_follow?: boolean;
  can_view_member_crm_follow?: boolean;
};

export type PromoterUpdatePayload = Partial<{
  display_name: string;
  phone: string | null;
  matchmaker_type: PromoterMatchmakerType | null;
  slogan: string | null;
  commission_level_id: number | null;
  visible: boolean;
  can_view_lead_follow: boolean;
  can_write_lead_follow: boolean;
  can_view_member_crm_follow: boolean;
}>;

export type PromoterTeamUpdatePayload = {
  team_id: number | null;
  reason?: string;
};

// ─── 推广红娘线上分成明细类型 ─────────────────────────────
export interface PromoterCommissionEntryItem {
  id: number;
  created_at: string;
  promoter_id: number;
  promoter_name: string;
  promoter_avatar: string | null;
  consumer_id: number;
  consumer_name: string;
  consumer_phone: string | null;
  event_name: string;
  order_id: number | null;
  order_no: string | null;
  base_amount: string;
  amount: string;
  status: "PENDING" | "AVAILABLE" | "FROZEN" | "REVERSED";
}

export interface PromoterCommissionEntryPage {
  items: PromoterCommissionEntryItem[];
  page: number;
  page_size: number;
  total: number;
  has_more: boolean;
}

export type PromoterCommissionEntryListQuery = {
  page?: number;
  page_size?: number;
  promoter_id?: number;
  rule_id?: number;
  start_date?: string;
  end_date?: string;
};

export interface PromoterCommissionEntryOptions {
  promoters: { id: number; name: string; avatar: string | null }[];
  events: { id: number; name: string }[];
}

export interface PromoterPosterResponse {
  promoter_id: number;
  url: string;
  qr_content: string;
}

export interface PromoterPlatformTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
  expires_in: number;
  jump_url: string;
}

// ─── 推广红娘分成配置（4 固定级别）类型 ────────────────────────────
export type PromoterAutoSplitMode = "fixed_amount" | "auto_rate";
export type PromoterConsumeCommissionMode = "none" | "auto_rate";

export interface PromoterLevelItem {
  id: number;
  level_id: 1 | 2 | 3 | 4;
  level_name: string;
  auto_split_mode: PromoterAutoSplitMode;
  auto_split_mode_label: string;
  auto_split_rate: string | null;
  promote_threshold: number | null;
  promote_threshold_text: string;
  matchmaker_count: number;
  register_reward_male: string;
  register_reward_female: string;
  consume_commission_mode: PromoterConsumeCommissionMode;
  consume_commission_rate: string | null;
  updated_at: string | null;
}

export interface PromoterLevelPage {
  items: PromoterLevelItem[];
}

export type PromoterLevelUpdatePayload = {
  promote_threshold?: number | null;
  register_reward_male?: string | null;
  register_reward_female?: string | null;
  consume_commission_mode?: PromoterConsumeCommissionMode | null;
  consume_commission_rate?: string | null;
};

// ─── 分派配置类型 ────────────────────────────────────────────
export type ApportionScope = "member_crm" | "customer_lead";
export type ApportionConfigType = "assign" | "abandon";
export type ApportionStrategy = "designated" | "round_robin_random" | "by_region" | "by_promoter" | "by_partner" | "none";

export interface ApportionConfig {
  id: number;
  scope: ApportionScope;
  config_type: ApportionConfigType;
  strategy: ApportionStrategy | null;
  target_matchmaker_id: number | null;
  target_matchmaker_name: string | null;
  auto_abandon_days: number | null;
  daily_pickup_limit: number | null;
  show_admin_abandoned_in_pool: boolean;
  show_store_abandoned_in_pool: boolean;
  is_enabled: boolean;
  updated_by: number | null;
  remark: string | null;
  created_at: string | null;
  updated_at: string | null;
}

// ─── 服务红娘管理（总店）类型 ────────────────────────────────
export type MatchmakerRoleTag = "super" | "normal";

export interface MatchmakerStaffItem {
  id: number;
  avatar: string | null;
  display_name: string;
  username: string | null;
  store_id: number | null;
  store_name: string | null;
  role_tag: MatchmakerRoleTag;
  role_label: string;
  phone: string | null;
  wechat: string | null;
  commission_level_id: number | null;
  commission_level_name: string | null;
  commission_rate: string | null;
  success_count: number;
  commission_amount: string;
  locked: boolean;
  visible: boolean;
  menu_permission_count?: number;
  wechat_qr: string | null;
  description: string | null;
  /** 以下 4 个字段由后端同事同步添加，目前可能尚未返回 */
  slogan: string | null;
  sort: number | null;
  contact_editable: boolean | null;
  lock_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface MatchmakerStaffDetail extends MatchmakerStaffItem {
  account_id: number | null;
  data_scope: "SELF" | "STORE" | "ORGANIZATION" | "ALL" | null;
  intro: string | null;
  wechat_qr: string | null;
}

export interface MatchmakerStaffPage {
  items: MatchmakerStaffItem[];
  page: number;
  page_size: number;
  total: number;
  has_more: boolean;
}

export interface MatchmakerUserCandidate {
  id: number;
  nickname: string | null;
  phone: string | null;
  avatar: string | null;
}

export type MatchmakerStaffListQuery = {
  page?: number;
  page_size?: number;
  keyword?: string;
  store_id?: number;
  commission_level_id?: number;
  locked?: boolean;
  /** true 仅分店红娘 / false 仅总店红娘 / 不传 全部 */
  in_store?: boolean;
};

export type MatchmakerStaffCreatePayload = {
  user_id?: number;
  lookup?: string;
  lookup_by?: "nickname" | "phone";
  avatar?: string | null;
  display_name: string;
  phone: string;
  wechat?: string | null;
  wechat_qr?: string | null;
  store_id?: number;
  commission_level_id?: number;
  role_tag?: MatchmakerRoleTag;
  description?: string | null;
  visible?: boolean;
  slogan?: string | null;
  sort?: number;
  contact_editable?: boolean;
  lock_at?: string | null;
};

export type MatchmakerStaffUpdatePayload = Partial<{
  user_id: number;
  lookup: string;
  lookup_by: "nickname" | "phone";
  avatar: string | null;
  display_name: string;
  phone: string;
  wechat: string | null;
  wechat_qr: string | null;
  store_id: number;
  commission_level_id: number;
  role_tag: MatchmakerRoleTag;
  description: string | null;
  password: string;
  visible: boolean;
  slogan: string | null;
  sort: number;
  contact_editable: boolean;
  lock_at: string | null;
}>;

export interface MatchmakerTutorial {
  title: string;
  content: string;
  link_url: string | null;
  updated_at: string | null;
}

export interface AdminMenuNode {
  id: number;
  parent_id: number | null;
  name: string;
  path: string | null;
  menu_type: "directory" | "menu" | "button";
  permission_code: string | null;
  icon: string | null;
  sort: number;
  children: AdminMenuNode[];
}

export interface MatchmakerPermissions {
  matchmaker_id: number;
  menuIds: number[];
}

export type MatchmakerPermissionsUpdatePayload = { menuIds: number[] };

export interface CommissionLevelDictItem {
  id: number;
  code: string;
  name: string;
  rate_percent: string;
  sort: number;
  status: 1 | 2;
}

export interface StoreDictItem {
  id: number;
  code: string;
  name: string;
  display_name: string | null;
  status: 1 | 2 | 3;
}

// ─── 分店管理（M5） ─────────────────────────────────────────
export interface StoreAdminItem {
  id: number;
  code: string;
  name: string;
  display_name: string | null;
  region_code: string | null;
  link_url: string | null;
  sort_order: number;
  qr_code: string | null;
  status: 1 | 2 | 3;
  auto_redirect: boolean;
  member_count: number;
  matchmaker_count: number;
  created_at: string;
  updated_at: string;
}

export interface StoreAdminPage {
  items: StoreAdminItem[];
  page: number;
  page_size: number;
  total: number;
  has_more: boolean;
}

export type StoreAdminCreatePayload = {
  code: string;
  name: string;
  display_name?: string | null;
  region_code?: string | null;
  link_url?: string | null;
  sort_order?: number;
  qr_code?: string | null;
  auto_redirect?: boolean;
};

export type StoreAdminUpdatePayload = Partial<Omit<StoreAdminCreatePayload, "code">>;

export interface StoreReportSummary {
  store_id: number;
  store_name: string | null;
  lead_count: number;
  member_count: number;
  online_match_count: number;
  online_vip_count: number;
  offline_vip_count: number;
  meeting_arranged_count: number;
  online_commission: string;
  offline_performance: string;
  meeting_rank: number | null;
  online_commission_rank: number | null;
  offline_performance_rank: number | null;
}

export interface StoreReportMonthlyRow {
  month: string;
  new_male_members: number;
  new_female_members: number;
  new_leads: number;
  new_online_vip: number;
  new_match_requests: number;
  new_offline_meetings: number;
  new_offline_vip: number;
  online_commission: string;
  offline_performance: string;
}

export interface StoreReportMonthly {
  store_id: number;
  months: StoreReportMonthlyRow[];
}

export interface StoreCommissionEntryItem {
  id: number;
  created_at: string;
  store_id: number;
  store_name: string;
  matchmaker_id: number | null;
  matchmaker_name: string | null;
  consumer_id: number | null;
  consumer_name: string | null;
  event_name: string;
  order_id: number;
  order_no: string | null;
  consumer_amount: string;
  commission_amount: string;
  status: string;
}

export interface StoreCommissionEntryPage {
  items: StoreCommissionEntryItem[];
  page: number;
  page_size: number;
  total: number;
  has_more: boolean;
}

export interface StoreOption {
  id: number;
  name: string;
  status: number;
}

export interface StoreCommissionOptions {
  stores: StoreOption[];
  matchmakers: Array<{ id: number; name: string; avatar?: string | null }>;
  events: Array<{ id: number; name: string; beneficiary_type: string }>;
}

export interface StoreCommissionSummary {
  total_amount: string;
  current_month_amount: string;
  previous_month_amount: string;
  pending_amount: string;
}

export type StoreCommissionEntryQuery = {
  page?: number;
  page_size?: number;
  store_id?: number;
  matchmaker_id?: number;
  rule_id?: number;
  start_date?: string;
  end_date?: string;
};

// ─── 合伙红娘（M6）：合伙人管理 / 团队关系 / 分成明细 / 分成配置 ────────

export type PartnerLevelId = 1 | 2 | 3;

export interface PartnerStaffItem {
  id: number;
  team_id: number;
  user_id: number;
  account: string | null;
  display_name: string | null;
  avatar: string | null;
  phone: string | null;
  team_name: string;
  level_id: PartnerLevelId;
  level_name: string | null;
  member_count: number;
  performance_amount: string;
  effective_member_count: number;
  commission_amount: string;
  status: 1 | 2 | 3;
  status_label: string;
  open_mode: string;
  created_at: string | null;
}

export interface PartnerStaffPage {
  items: PartnerStaffItem[];
  page: number;
  page_size: number;
  total: number;
  has_more: boolean;
}

export interface PartnerStaffDetail extends PartnerStaffItem {
  owner_nickname: string | null;
  owner_phone: string | null;
  invite_code: string | null;
}

export interface PartnerStatistics {
  total_partners: number;
  active_partners: number;
  total_members: number;
  total_effective_members: number;
  total_performance: string;
  total_commission: string;
}

export interface PartnerUserCandidate {
  id: number;
  nickname: string | null;
  real_name: string | null;
  phone: string | null;
  avatar: string | null;
  is_promoter: boolean;
  has_team: boolean;
}

export interface PartnerStaffCreatePayload {
  user_id?: number;
  lookup?: string;
  lookup_by?: "nickname" | "phone";
  team_name: string;
  level_id?: PartnerLevelId;
  open_mode?: "manual" | "paid";
}

export interface PartnerStaffUpdatePayload {
  team_name?: string;
  level_id?: PartnerLevelId;
  status?: 1 | 2 | 3;
  open_mode?: "manual" | "paid";
}

export type PartnerStaffListQuery = {
  page?: number;
  page_size?: number;
  keyword?: string;
  level_id?: PartnerLevelId;
  status?: 1 | 2 | 3;
  sort?: "created_desc" | "created_asc" | "performance_desc" | "member_desc";
};

export interface PartnerRelationItem {
  id: number;
  promoter_id: number;
  promoter_name: string | null;
  promoter_avatar: string | null;
  promoter_phone: string | null;
  team_id: number;
  team_name: string | null;
  joined_at: string | null;
  left_at: string | null;
  member_count: number;
  performance_amount: string;
  status: 1 | 2 | 3;
  status_label: string;
  change_reason: string | null;
}

export interface PartnerRelationPage {
  items: PartnerRelationItem[];
  page: number;
  page_size: number;
  total: number;
  has_more: boolean;
}

export interface PartnerTeamOption {
  id: number;
  name: string;
  owner_user_id: number | null;
  owner_name: string | null;
  level_id: PartnerLevelId | null;
  level_name: string | null;
}

export interface PartnerRelationBindPayload {
  promoter_user_id?: number;
  promoter_lookup?: string;
  team_id: number;
  reason?: string;
}

export interface PartnerRelationResult {
  promoter_id: number;
  team_id: number | null;
  team_name: string | null;
  status: "BOUND" | "REMOVED";
  message: string;
}

export interface PartnerCommissionEntryItem {
  id: number;
  created_at: string | null;
  partner_id: number;
  partner_name: string | null;
  team_id: number | null;
  team_name: string | null;
  promoter_id: number | null;
  promoter_name: string | null;
  event_type: string | null;
  event_name: string | null;
  consumer_id: number | null;
  consumer_name: string | null;
  order_id: number | null;
  order_no: string | null;
  base_amount: string;
  amount: string;
  status: string;
  source: string;
  remark: string | null;
}

export interface PartnerCommissionEntryPage {
  items: PartnerCommissionEntryItem[];
  page: number;
  page_size: number;
  total: number;
  has_more: boolean;
}

export interface PartnerCommissionOptions {
  partners: Array<{ id: number; name: string; team_id: number | null; team_name: string | null; avatar: string | null }>;
  events: Array<{ id: number; name: string }>;
}

export type PartnerCommissionEntryQuery = {
  page?: number;
  page_size?: number;
  partner_id?: number;
  rule_id?: number;
  start_date?: string;
  end_date?: string;
};

export interface PartnerCommissionEntryCreatePayload {
  partner_user_id: number;
  consumer_user_id?: number;
  rule_id?: number;
  amount: number | string;
  base_amount?: number | string;
  remark?: string;
}

export interface PartnerCommissionEntryCreateResult {
  entry: PartnerCommissionEntryItem;
  ledger_id: number;
  balance_after: string;
}

export interface PartnerBonusItem {
  name: string;
  amount: string;
}

export interface PartnerLevelItem {
  id: number;
  level_id: PartnerLevelId;
  level_name: string;
  auto_split_mode: "fixed_amount" | "auto_rate";
  auto_split_mode_label: string;
  auto_split_rate: string | null;
  promote_performance_threshold: string | null;
  promote_member_threshold: number | null;
  promote_condition_text: string;
  partner_count: number;
  register_reward_male: string;
  register_reward_female: string;
  promoter_join_reward: string;
  consume_commission_mode: "none" | "auto_rate";
  consume_commission_rate: string | null;
  share_bonus: boolean;
  bonus_items: PartnerBonusItem[];
  updated_at: string | null;
}

export interface PartnerLevelPage {
  items: PartnerLevelItem[];
}

export interface PartnerLevelUpdatePayload {
  level_name?: string;
  auto_split_mode?: "fixed_amount" | "auto_rate";
  auto_split_rate?: string | number;
  promote_performance_threshold?: string | number;
  promote_member_threshold?: number;
  register_reward_male?: string | number;
  register_reward_female?: string | number;
  promoter_join_reward?: string | number;
  consume_commission_mode?: "none" | "auto_rate";
  consume_commission_rate?: string | number;
  share_bonus?: boolean;
  bonus_items?: PartnerBonusItem[];
}

export interface MatchmakerPosterResponse {
  matchmaker_id: number;
  url: string;
  qr_content: string;
}

export interface MatchmakerPlatformTokenResponse {
  matchmaker_id: number;
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
  expires_in: number;
  jump_url: string;
}

export interface MatchmakerWorkReport {
  matchmaker_id: number;
  from_date: string;
  to_date: string;
  new_lead_count: number;
  new_member_count: number;
  lead_follow_up_count: number;
  matchmaking_count: number;
  success_count: number;
  follow_up_count: number;
  meeting_request_count: number;
  meeting_arranged_count: number;
  commission_amount: string;
  offline_income: string;
  assigned_member_count: number;
}

export interface MatchmakerDetailReport {
  matchmaker_id: number;
  from_date: string;
  to_date: string;
  work_report: MatchmakerWorkReport;
  funnel: { stage: string; label: string; count: number }[];
  monthly_trends: unknown[];
  success_rate: string;
  platform_success_rate: string;
  export_url: string | null;
}

// ─── 管理端首页（admin/dashboard、公告、学苑栏目） ─────────────────
export interface DashboardMetrics {
  member_count: number;
  platform_user_count: number;
  wechat_fan_count: number;
  online_days: number;
  lead_count: number;
  customer_lead_count: number;
  vip_count: number;
  online_vip_count: number;
  offline_vip_count: number;
  matchmaker_count: number;
  service_matchmaker_count: number;
  promotion_matchmaker_count: number;
  successful_match_count: number;
  male_member_count: number;
  female_member_count: number;
  pending_withdrawal_count: number;
  online_income: string;
  offline_income: string;
}

export interface DashboardPending {
  withdrawal: number;
  matchmaker_application: number;
  matchmaker_service: number;
  match_application: number;
  report: number;
}

export interface DashboardGender {
  male: number;
  female: number;
  unspecified: number;
}

export interface IncomeRankItem {
  product_type: string;
  income: string;
  proportion: string;
}

export interface DashboardTrend {
  date: string;
  member_count: number;
  lead_count: number;
  paid_count: number;
  paid_amount: string;
  online_paid_amount: string;
  offline_paid_amount: string;
  net_amount: string;
}

export interface AdminDashboardReport {
  from_date: string;
  to_date: string;
  metrics: DashboardMetrics;
  pending: DashboardPending;
  member_gender: DashboardGender;
  income_rank: IncomeRankItem[];
  trends: DashboardTrend[];
}

export interface AnnouncementItem {
  id: number;
  version_id: number | null;
  category: string;
  title: string;
  title_color: string | null;
  title_bold: boolean;
  top: boolean;
  sort_order: number;
  link_to: string | null;
  created_at: string;
  read: boolean;
}

export interface AnnouncementPage {
  items: AnnouncementItem[];
  page: number;
  page_size: number;
  total: number;
  has_more: boolean;
}

export interface AcademyCategory {
  id: number;
  parent_id: number | null;
  name: string;
  description: string | null;
  sort: number;
  enabled: boolean;
  matchmaker_class_enabled: boolean;
  children: AcademyCategory[];
}

export interface AdminBootstrap {
  operator: { id: number; account: string; name: string; permissions: string[]; locked: boolean };
  authorization: { status: string; expires_at: string | null; sms_remaining_count: number };
  header: { has_unread_feedback: boolean; unread_announcement_count: number; sms: { success_count: number; failed_count: number; remaining_count: number } };
}

const list = (path: string, query: AdminListQuery = {}) => adminApi(path, { method: "GET", query });
const create = (path: string, body: JsonBody) => adminApi(path, { method: "POST", body });
const update = (path: string, body: JsonBody) => adminApi(path, { method: "PATCH", body });

export interface AdminAccountItem {
  id: number;
  username: string;
  display_name: string;
  matchmaker_user_id: number | null;
  data_scope: "SELF" | "STORE" | "ORGANIZATION" | "ALL";
  organization_id: number | null;
  status: 1 | 2 | 3;
  failed_count: number;
  locked_until: string | null;
  last_login_at: string | null;
  last_login_ip: string | null;
  permissions: string[];
  created_at: string;
  updated_at: string;
}

export interface CertificationDetail {
  user_id: number;
  kind: "education" | "house" | "marriage";
  status: 0 | 1 | 2 | 3;
  submitted_at: string | null;
  reviewed_at: string | null;
  fail_reason: string | null;
  value: string | null;
  material_urls: { id: number; url: string; thumbnail_url: string | null; expires_at: string | null }[];
  reviewer_id: number | null;
  audit_history: Record<string, unknown>[];
}

// ─── 会员认证（M3-1）类型 ─────────────────────────────────────

// ─── 会员资料媒体验证（M3-2）类型 ──────────────────────────────
export type MemberMediaType = "avatar" | "photo" | "video";

export interface MemberIntroItem {
  id: number;
  user_id: number;
  member_code: string;
  nickname: string | null;
  avatar: string | null;
  self_intro: string | null;
  updated_at: string | null;
}

export interface MemberIntroPage {
  items: MemberIntroItem[];
  page: number;
  page_size: number;
  total: number;
  has_more: boolean;
}

export interface MemberMediaItem {
  id: number;
  user_id: number;
  member_code: string;
  nickname: string | null;
  avatar: string | null;
  media_type: MemberMediaType;
  file_url: string | null;
  thumbnail_url: string | null;
  mime_type: string | null;
  duration_seconds: number | null;
  review_status: number;
  review_status_label: string;
  review_reason: string | null;
  age: number | null;
  meta_text: string | null;
  created_at: string | null;
}

export interface MemberMediaPage {
  items: MemberMediaItem[];
  page: number;
  page_size: number;
  total: number;
  has_more: boolean;
}

export type MemberMediaReviewPayload = {
  review_status: number;
  review_reason?: string | null;
};

export type MemberMediaReplacePayload = {
  file_url: string;
  thumbnail_url?: string | null;
};

/** 个人介绍列表查询：布尔筛选按后端 bool 参数以 0/1 传递（adminApi 的 query 只支持 string|number） */
export type MemberIntroQuery = {
  page?: number;
  page_size?: number;
  keyword?: string;
  letter_mode?: string;
  letter_lower?: 0 | 1;
  digit?: 0 | 1;
  cn_digit?: 0 | 1;
};

/** 媒体列表查询 */
export type MemberMediaQuery = {
  media_type: MemberMediaType;
  page?: number;
  page_size?: number;
  review_status?: number;
  keyword?: string;
  gender?: number;
};

// ─── 线上行为（M3-3）类型 ─────────────────────────────────────
export type MemberBehaviorCategory = "browse" | "favorite" | "superlike" | "gift" | "report";

export interface MemberBehaviorItem {
  event_id: number;
  user_id: number;
  member_code: string;
  nickname: string | null;
  user_avatar: string | null;
  target_user_id: number | null;
  target_member_code: string | null;
  target_nickname: string | null;
  target_avatar: string | null;
  occurred_at: string | null;
  browse_times?: number | null;
  amount?: string | null;
  order_no?: string | null;
  pay_status?: number | null;
  pay_status_label?: string | null;
  pay_method?: string | null;
  event_status?: number | null;
  event_status_label?: string | null;
  gift_name?: string | null;
  gift_qty?: number | null;
  qty_unit?: string | null;
  point_cost?: number | null;
  paid_amount?: string | null;
  reward_points?: number | null;
  submit_ip?: string | null;
  report_type?: string | null;
  detail?: string | null;
  images?: string[] | null;
  report_status?: number | null;
  report_status_label?: string | null;
}

export interface MemberBehaviorPage {
  items: MemberBehaviorItem[];
  page: number;
  page_size: number;
  total: number;
  has_more: boolean;
}

// ─── 会员跟进全览与批量导入（M3-5） ──────────────────────────────
export type MemberFollowUpMethod = "PHONE" | "WECHAT" | "VISIT" | "OTHER";

export interface MemberFollowUpRow {
  id: number;
  user_id: number;
  member_code: string;
  nickname: string | null;
  avatar: string | null;
  matchmaker_name: string;
  method: string;
  method_label: string;
  content: string;
  note: string | null;
  intention_level: number | null;
  created_at: string | null;
}

export interface MemberFollowUpListPage {
  items: MemberFollowUpRow[];
  page: number;
  page_size: number;
  total: number;
  has_more: boolean;
}

export interface MemberFollowUpSummary {
  all: number;
  today: number;
  yesterday: number;
  three_days: number;
  this_week: number;
  last_week: number;
  this_month: number;
  last_month: number;
}

export interface MemberFollowUpImportResult {
  created: number;
  skipped: number;
  failed: number;
  errors: string[];
}

// ─── 线下VIP会员服务（M3-6） ────────────────────────────────────
export type OfflineVipProgress =
  | "matching"
  | "dating"
  | "deep"
  | "in_love"
  | "met_parents"
  | "paused"
  | "breakup"
  | "married";

export type OfflineVipContractStatus = "none" | "pending" | "signed" | "void";

export interface OfflineVipItem {
  id: number;
  user_id: number;
  member_code: string;
  nickname: string | null;
  avatar: string | null;
  phone: string | null;
  sign_date: string | null;
  package_name: string | null;
  progress: OfflineVipProgress;
  progress_label: string;
  service_start: string | null;
  service_end: string | null;
  last_follow_at: string | null;
  contract_amount: string;
  sales_matchmaker_id: number | null;
  sales_matchmaker_name: string | null;
  service_matchmaker_id: number | null;
  service_matchmaker_name: string | null;
  promoter_id: number | null;
  promoter_name: string | null;
  contract_status: OfflineVipContractStatus;
  contract_status_label: string;
  contract_no: string | null;
  promise_meet_count: number;
  success_meet_count: number;
  remark: string | null;
  attach_urls: string[];
  created_at: string | null;
  updated_at: string | null;
}

export interface OfflineVipPage {
  items: OfflineVipItem[];
  page: number;
  page_size: number;
  total: number;
  has_more: boolean;
}

export interface OfflineVipStatistics {
  store_count: number;
  vip_count: number;
  serving_count: number;
  expiring_count: number;
  expired_count: number;
  paid_count: number;
  promise_meet_total: number;
  promise_meet_month: number;
  refund_risk_count: number;
  refunded_count: number;
}

export interface OfflineVipCreatePayload {
  user_id?: number;
  lookup?: string;
  lookup_by?: "nickname" | "phone";
  sales_matchmaker_id?: number | null;
  service_matchmaker_id?: number | null;
  promoter_id?: number | null;
  sign_date?: string | null;
  service_start?: string | null;
  service_end?: string | null;
  package_name?: string | null;
  contract_amount?: string | number;
  promise_meet_count?: number;
  success_meet_count?: number;
  remark?: string | null;
  attach_urls?: string[];
}

export interface OfflineVipUpdatePayload {
  sales_matchmaker_id?: number | null;
  service_matchmaker_id?: number | null;
  promoter_id?: number | null;
  sign_date?: string | null;
  service_start?: string | null;
  service_end?: string | null;
  package_name?: string | null;
  contract_amount?: string | number;
  promise_meet_count?: number;
  success_meet_count?: number;
  progress?: OfflineVipProgress;
  remark?: string | null;
  attach_urls?: string[];
  meet_change_remark?: string | null;
}

export interface OfflineVipMeetLogItem {
  id: number;
  vip_id: number;
  before_count: number;
  after_count: number;
  remark: string | null;
  changed_by: number | null;
  changed_by_name: string | null;
  created_at: string | null;
}

export interface OfflineVipMeetLogPage {
  items: OfflineVipMeetLogItem[];
  page: number;
  page_size: number;
  total: number;
  has_more: boolean;
}

export interface OfflineVipOption {
  id: number;
  name: string;
  extra: string | null;
}

export interface OfflineVipOptions {
  sales_matchmakers: OfflineVipOption[];
  service_matchmakers: OfflineVipOption[];
  promoters: OfflineVipOption[];
  packages: string[];
}

export type MemberAuthKind = "realname" | "commitment" | "marriage" | "house" | "education" | "other";
export interface MemberAuthReviewItem {
  id: number;
  user_id: number;
  member_code: string;
  nickname: string | null;
  avatar: string | null;
  real_name: string | null;
  id_card_masked: string | null;
  file_url: string | null;
  result: string;
  result_label: string;
  created_at: string | null;
}

export interface MemberAuthReviewPage {
  items: MemberAuthReviewItem[];
  page: number;
  page_size: number;
  total: number;
  has_more: boolean;
}

export interface RealnameReviewItem extends MemberAuthReviewItem {
  gender: string | null;
  birthday: string | null;
  id_card_issued: string | null;
  id_card_front: string | null;
  id_card_back: string | null;
  face_method: string | null;
  face_vendor: string | null;
  face_score: string | null;
  face_photo: string | null;
}

export interface RealnameReviewPage {
  items: RealnameReviewItem[];
  page: number;
  page_size: number;
  total: number;
  has_more: boolean;
}

export interface RealnameStats {
  quota_remaining: number;
  success_count: number;
  fail_count: number;
  total_consumed: number;
}

export interface MarriageStats {
  quota_remaining: number;
  total_consumed: number;
}

export interface CommitmentReviewItem extends MemberAuthReviewItem {
  sign_times: number;
  title: string | null;
}

export interface CommitmentReviewPage {
  items: CommitmentReviewItem[];
  page: number;
  page_size: number;
  total: number;
  has_more: boolean;
}

export interface MarriageReviewItem extends MemberAuthReviewItem {
  check_method: string | null;
  declared_status: string | null;
  cost: string | null;
  checked_at: string | null;
}

export interface MarriageReviewPage {
  items: MarriageReviewItem[];
  page: number;
  page_size: number;
  total: number;
  has_more: boolean;
}

export interface HouseReviewItem extends MemberAuthReviewItem {}

export interface HouseReviewPage {
  items: HouseReviewItem[];
  page: number;
  page_size: number;
  total: number;
  has_more: boolean;
}

export interface EducationReviewItem extends MemberAuthReviewItem {
  degree: string | null;
  school: string | null;
}

export interface EducationReviewPage {
  items: EducationReviewItem[];
  page: number;
  page_size: number;
  total: number;
  has_more: boolean;
}

export interface OtherReviewItem extends MemberAuthReviewItem {
  auth_type_id: number | null;
  auth_type_name: string | null;
}

export interface OtherReviewPage {
  items: OtherReviewItem[];
  page: number;
  page_size: number;
  total: number;
  has_more: boolean;
}

export interface AuthTypeItem {
  id: number;
  name: string;
  icon_url: string | null;
  description: string | null;
  require_realname: boolean;
  sort: number;
  status: number;
  created_at: string | null;
  updated_at: string | null;
}

export type AuthTypePayload = {
  name: string;
  icon_url?: string | null;
  description?: string | null;
  require_realname?: boolean;
  sort?: number;
  status?: number;
};

/* ─── 会员CRM 数据报表（GET admin/member-statistics） ─────────────── */
export interface MemberStatDistItem {
  label: string;
  value: number;
}

export interface MemberStatGrowthRow {
  date: string;
  member_count: number;
  male_count: number;
  female_count: number;
  vip_count: number;
  apply_count: number;
  failed_count: number;
  success_count: number;
}

export interface MemberStatFollowRow {
  matchmaker: string;
  member_count: number;
  never_followed: number;
  over_3_days: number;
  over_7_days: number;
  over_15_days: number;
  over_30_days: number;
  follow_count: number;
  month_follow_count: number;
}

export interface MemberStatIntentionItem {
  label: string;
  count: number;
}

export interface MemberStatBrowseRow {
  date: string;
  home_views: number;
  profile_views: number;
  popular_member: string;
}

export interface MemberStatPreferenceReport {
  age: MemberStatDistItem[];
  marriage: MemberStatDistItem[];
  height: MemberStatDistItem[];
  education: MemberStatDistItem[];
  housing: MemberStatDistItem[];
  smoking: MemberStatDistItem[];
  drinking: MemberStatDistItem[];
  goal: MemberStatDistItem[];
  occupation: MemberStatDistItem[];
}

export interface MemberStatGroups {
  follow: MemberStatDistItem[];
  intention: MemberStatDistItem[];
  basic: MemberStatDistItem[];
  requirement: MemberStatDistItem[];
  browse: MemberStatDistItem[];
  popularity: MemberStatDistItem[];
  basic_groups: Record<string, MemberStatDistItem[]>;
  browse_daily: MemberStatDistItem[];
  popularity_female: MemberStatDistItem[];
  popularity_male: MemberStatDistItem[];
  apply_female: MemberStatDistItem[];
  apply_male: MemberStatDistItem[];
  growth: MemberStatGrowthRow[];
  follow_report: MemberStatFollowRow[];
  browse_report: MemberStatBrowseRow[];
  requirements: { male: MemberStatPreferenceReport; female: MemberStatPreferenceReport };
  preference_labels: Record<string, string>;
  intention_report: MemberStatIntentionItem[];
}

export interface MemberStatMetrics {
  total_members: number;
  today_members: number;
  max_daily_members: number;
  max_daily_date: string;
  max_monthly_members: number;
  max_monthly_month: string;
}

export interface MemberStatisticsReport {
  from_date: string;
  to_date: string;
  groups: MemberStatGroups;
  totals: Record<string, number>;
  metrics: MemberStatMetrics;
}

export const adminEndpoints = {
  login: (body: { username: string; password: string }) => adminApi<{ access_token: string; refresh_token: string; token_type: "bearer"; expires_in: number; account: Record<string, unknown> }>("admin/matchmaker/auth/login", { method: "POST", body }),
  me: () => adminApi<{ account: Record<string, unknown>; permissions: string[] }>("admin/matchmaker/auth/me"),
  refresh: (body: { refresh_token: string }) => adminApi<{ access_token: string; refresh_token: string; token_type: "bearer"; expires_in: number; account: Record<string, unknown> }>("admin/matchmaker/auth/refresh", { method: "POST", body }),
  logout: () => adminApi<void>("admin/matchmaker/auth/logout", { method: "POST" }),
  bootstrap: () => adminApi<AdminBootstrap>("admin/bootstrap"),
  dashboard: (query: DashboardQuery = {}) => adminApi<AdminDashboardReport>("admin/dashboard", { method: "GET", query }),
  announcements: (query: { page?: number; page_size?: number; category?: string; keyword?: string } = {}) => adminApi<AnnouncementPage>("admin/announcements", { method: "GET", query }),
  academyCategories: () => adminApi<AcademyCategory[]>("admin/academy/categories"),
  memberStatistics: (query: DashboardQuery = {}) => adminApi<MemberStatisticsReport>("admin/member-statistics", { method: "GET", query }),
  dashboardStats: () => adminApi<Record<string, unknown>>("admin/dashboard/stats"),
  adminAccounts: (query: AdminListQuery = {}) => adminApi<{ items: AdminAccountItem[]; page: number; page_size: number; total: number; has_more: boolean }>("admin/matchmaker/accounts", { method: "GET", query }),
  adminAccount: (id: number | string) => adminApi<AdminAccountItem>(`admin/matchmaker/accounts/${id}`),
  createAdminAccount: (body: JsonBody) => create("admin/matchmaker/accounts", body),
  updateAdminAccount: (id: number | string, body: JsonBody) => update(`admin/matchmaker/accounts/${id}`, body),
  updateAdminAccountStatus: (id: number | string, body: JsonBody) => update(`admin/matchmaker/accounts/${id}/status`, body),
  resetAdminAccountPassword: (id: number | string, body: JsonBody) => create(`admin/matchmaker/accounts/${id}/reset-password`, body),
  adminAccountSessions: (id: number | string, query: AdminListQuery = {}) => list(`admin/matchmaker/accounts/${id}/sessions`, query),
  revokeAdminAccountSessions: (id: number | string) => adminApi<void>(`admin/matchmaker/accounts/${id}/sessions/revoke-all`, { method: "POST" }),
  adminLoginLogs: (query: AdminListQuery = {}) => list("admin/matchmaker/accounts/login-logs", query),
  users: (query: AdminListQuery = {}) => list("admin/matchmaker/members", query),
  user: (id: number | string) => adminApi(`admin/matchmaker/members/${id}`),
  loginLogs: (id: number | string, query: AdminListQuery = {}) => list(`admin/members/${id}/behavior/login-logs`, query),
  memberFollowUpsOverview: (query: AdminListQuery = {}) => list("admin/members/follow-ups", query),
  customerLeads: (query: AdminListQuery = {}) => list("admin/customer-leads", query),
  createCustomerLead: (body: JsonBody) => create("admin/customer-leads", body),
  updateCustomerLead: (id: number | string, body: JsonBody) => update(`admin/customer-leads/${id}`, body),
  customerLead: (id: number | string) => adminApi(`admin/customer-leads/${id}`),
  customerLeadFollowUps: (id: number | string, query: AdminListQuery = {}) => list(`admin/customer-leads/${id}/follow-ups`, query),
  createCustomerLeadFollowUp: (id: number | string, body: JsonBody) => create(`admin/customer-leads/${id}/follow-ups`, body),
  assignCustomerLead: (id: number | string, body: JsonBody) => update(`admin/customer-leads/${id}/assignment`, body),
  customerLeadStatistics: () => adminApi("admin/customer-leads/statistics"),
  abandonedCustomerLeads: () => adminApi("admin/customer-leads/abandoned"),
  customerLeadAbandonments: () => adminApi("admin/customer-leads/abandonments"),
  abandonCustomerLead: (id: number | string, reason: string) => create(`admin/customer-leads/${id}/abandon`, { reason }),
  restoreCustomerLead: (id: number | string, reason: string) => create(`admin/customer-leads/${id}/restore`, { reason }),
  batchImportCustomerLeads: (body: { rows: Array<{ name: string; phone?: string; wechat?: string; source: string; intention_level: 1 | 2 | 3; remark?: string }>; dup_mode: "skip" | "append" }) =>
    adminApi("admin/customer-leads/batch-import", { method: "POST", body }),
  // 客源批量导入：模板下载（xlsx）+ 文件导入（FormData）+ 下拉字典
  customerLeadOptions: () => adminApi<CustomerLeadOptions>("admin/customer-leads/options"),
  downloadCustomerLeadTemplate: () =>
    downloadAdminFile("admin/customer-leads/import-template", "客源批量导入模板.xlsx"),
  importCustomerLeads: (form: FormData) =>
    adminApi<CustomerLeadImportSummary>("admin/customer-leads/import", { method: "POST", body: form }),
  members: (query: AdminListQuery = {}) => list("admin/matchmaker/members", query),
  member: (id: number | string) => adminApi(`admin/matchmaker/members/${id}`),
  createMember: (body: JsonBody) => create("admin/matchmaker/members", body),
  updateMember: (id: number | string, body: JsonBody) => update(`admin/matchmaker/members/${id}`, body),
  memberCertifications: (id: number | string) => adminApi<{ education: CertificationDetail; house: CertificationDetail; marriage: CertificationDetail }>(`admin/matchmaker/members/${id}/certifications`),
  memberCertification: (id: number | string, kind: "education" | "house" | "marriage") => adminApi<CertificationDetail>(`admin/matchmaker/members/${id}/certifications/${kind}`),
  memberAuditLogs: (id: number | string) => adminApi<Record<string, unknown>[]>(`admin/matchmaker/members/${id}/audit-logs`),
  updateMemberStatus: (id: number | string, body: JsonBody) => update(`admin/matchmaker/members/${id}/status`, body),
  matchmakers: (query: AdminListQuery = {}) => list("admin/matchmaker/matchmakers", query),
  matchmaker: (id: number | string) => adminApi(`admin/matchmaker/matchmakers/${id}`),
  updateMatchmakerStatus: (id: number | string, body: JsonBody) => update(`admin/matchmaker/matchmakers/${id}/status`, body),
  branches: (query: AdminListQuery = {}) => list("admin/matchmaker/branches", query),
  branch: (id: number | string) => adminApi(`admin/matchmaker/branches/${id}`),
  store: (id: number | string) => adminApi(`admin/matchmaker/stores/${id}`),
  updateStore: (id: number | string, body: JsonBody) => update(`admin/matchmaker/stores/${id}`, body),
  updateStoreStatus: (id: number | string, body: JsonBody) => update(`admin/matchmaker/stores/${id}/status`, body),
  storeMembers: (id: number | string, query: AdminListQuery = {}) => list(`admin/matchmaker/stores/${id}/members`, query),
  removeStoreMember: (id: number | string, reason: string) => adminApi(`admin/matchmaker/store-members/${id}`, { method: "DELETE", query: { reason } }),
  storeReport: (id: number | string) => adminApi<Record<string, unknown>>(`admin/matchmaker/stores/${id}/report`),
  createBranch: (body: JsonBody) => create("admin/matchmaker/branches", body),
  createBranchMember: (id: number | string, body: JsonBody) => create(`admin/matchmaker/branches/${id}/members`, body),
  assignments: (query: AdminListQuery = {}) => list("admin/matchmaker/assignments", query),
  createAssignment: (body: JsonBody) => create("admin/matchmaker/assignments", body),
  endAssignment: (id: number | string, reason: string) => adminApi(`admin/matchmaker/assignments/${id}/end`, { method: "POST", query: { reason } }),
  activities: (query: AdminListQuery = {}) => list("admin/activities", query),
  createActivity: (body: JsonBody) => create("admin/activities", body),
  updateActivity: (id: number | string, body: JsonBody) => update(`admin/activities/${id}`, body),
  merchants: (query: AdminListQuery = {}) => list("admin/merchants", query),
  createMerchant: (body: JsonBody) => create("admin/merchants", body),
  updateMerchant: (id: number | string, body: JsonBody) => update(`admin/merchants/${id}`, body),
  merchantProducts: (query: AdminListQuery = {}) => list("admin/merchant-products", query),
  createMerchantProduct: (body: JsonBody) => create("admin/merchant-products", body),
  updateMerchantProduct: (id: number | string, body: JsonBody) => update(`admin/merchant-products/${id}`, body),
  merchantOrders: (query: AdminListQuery = {}) => list("admin/merchant-orders", query),
  updateMerchantOrder: (id: number | string, body: JsonBody) => update(`admin/merchant-orders/${id}`, body),
  videos: (query: AdminListQuery = {}) => list("admin/videos", query),
  createVideo: (body: JsonBody) => create("admin/videos", body),
  updateVideo: (id: number | string, body: JsonBody) => update(`admin/videos/${id}`, body),
  videoComments: (query: AdminListQuery = {}) => list("admin/video-comments", query),
  updateVideoComment: (id: number | string, body: JsonBody) => update(`admin/video-comments/${id}`, body),
  videoTips: (query: AdminListQuery = {}) => list("admin/video-tips", query),
  updateVideoTip: (id: number | string, body: JsonBody) => update(`admin/video-tips/${id}`, body),
  moderationItems: (query: PageQuery = {}) => adminApi("admin/community/moderation-items", { method: "GET", query }),
  reviewModerationItem: (taskId: number | string, body: ReviewPayload) => adminApi(`admin/community/moderation-items/${taskId}/review`, { method: "PATCH", body }),
  moderatePost: (postId: number | string, body: ReviewPayload) => adminApi(`admin/community/posts/${postId}/moderation`, { method: "PATCH", body }),
  moderateComment: (commentId: number | string, body: ReviewPayload) => adminApi(`admin/community/comments/${commentId}/moderation`, { method: "PATCH", body }),
  moderatePaperPlane: (planeId: number | string, body: ReviewPayload) => adminApi(`admin/community/paper-planes/${planeId}/moderation`, { method: "PATCH", body }),
  reports: (query: PageQuery = {}) => adminApi("admin/reports", { method: "GET", query }),
  report: (reportId: number | string) => adminApi(`admin/reports/${reportId}`),
  reviewReport: (reportId: number | string, body: ReviewPayload) => adminApi(`admin/reports/${reportId}/review`, { method: "PATCH", body }),
  reportAppeals: (query: PageQuery = {}) => adminApi("admin/report-appeals", { method: "GET", query }),
  reviewReportAppeal: (appealId: number | string, body: ReviewPayload) => adminApi(`admin/report-appeals/${appealId}/review`, { method: "PATCH", body }),
  reviewMedia: (mediaId: number | string, body: ReviewPayload) => adminApi(`admin/media/${mediaId}/review`, { method: "PATCH", body }),
  reviewCertification: (userId: number | string, kind: "education" | "house" | "marriage", body: { status: 2 | 3; reason?: string }) =>
    adminApi(`admin/users/${userId}/certifications/${kind}/review`, { method: "PATCH", body }),
  crmRealnameReviews: (query: AdminListQuery = {}) => list("admin/matchmaker/members/realname-reviews", query),
  reviewCrmRealname: (userId: number | string, body: { status: 2 | 3 | 4; reason?: string }) =>
    update(`admin/matchmaker/members/${userId}/realname/review`, body),
  crmCertificationReviews: (query: AdminListQuery = {}) => list("admin/matchmaker/members/certification-reviews", query),
  reviewCrmCertification: (userId: number | string, kind: "education" | "house" | "marriage", body: { status: 2 | 3; reason?: string }) =>
    update(`admin/matchmaker/members/${userId}/certifications/${kind}/review`, body),
  reviewMatchmakerApplication: (applicationId: number | string, body: Record<string, unknown>) =>
    adminApi(`admin/matchmaker/applications/${applicationId}`, { method: "PATCH", body }),
  grantAdmin: (body: { user_id: number; permissions: string[] }) => adminApi("admin/users/grant", { method: "POST", body }),
  serviceRequests: (query: PageQuery = {}) => adminApi("admin/matchmaker/service-requests", { method: "GET", query }),
  updateServiceRequest: (serviceId: number | string, body: Record<string, unknown>) => adminApi(`admin/matchmaker/service-requests/${serviceId}`, { method: "PATCH", body }),
  scheduleMeeting: (requestId: number | string, body: Record<string, unknown>) => adminApi(`admin/matchmaker/meetings/requests/${requestId}/schedule`, { method: "POST", body }),
  meetingRequestOptions: () => adminApi("admin/matchmaker/meetings/options"),
  meetingRequestDelete: (requestId: number | string) => adminApi(`admin/matchmaker/meetings/requests/${requestId}`, { method: "DELETE" }),
  meetingDelete: (meetingId: number | string) => adminApi(`admin/matchmaker/meetings/${meetingId}`, { method: "DELETE" }),
  meetingRequests: (query: AdminListQuery = {}) => list("admin/matchmaker/meetings/requests", query),
  meetingRequest: (requestId: number | string) => adminApi(`admin/matchmaker/meetings/requests/${requestId}`),
  updateMeetingRequest: (requestId: number | string, body: JsonBody) => update(`admin/matchmaker/meetings/requests/${requestId}`, body),
  meetings: (query: AdminListQuery = {}) => list("admin/matchmaker/meetings", query),
  meetingStatistics: () => adminApi<MeetingStatistics>("admin/matchmaker/meetings/statistics"),
  createMeetingDirect: (body: MeetingDirectPayload) =>
    adminApi("admin/matchmaker/meetings", { method: "POST", body }),
  meeting: (id: number | string) => adminApi(`admin/matchmaker/meetings/${id}`),
  updateMeeting: (id: number | string, body: JsonBody) => update(`admin/matchmaker/meetings/${id}`, body),
  meetingFeedback: (id: number | string) => adminApi<Record<string, unknown>[]>(`admin/matchmaker/meetings/${id}/feedback`),
  matchRecords: (query: AdminListQuery = {}) => list("admin/matchmaker/match-records", query),
  createMatchRecord: (body: { from_love_user_id: number; to_love_user_id: number; create_time: string; complete_time: string; line_status: 1 | 2 }) =>
    adminApi("admin/matchmaker/match-records", { method: "POST", body }),
  // ─── 会员服务-推广管理（推广服务订单） ─────────────────────────────
  promotionOrders: (query: AdminListQuery = {}) =>
    adminApi<PromotionOrderPage>("admin/promotion-orders", { method: "GET", query }),
  promotionOrderStatistics: () => adminApi<PromotionOrderStatistics>("admin/promotion-orders/statistics"),
  promotionOrder: (id: number | string) => adminApi<PromotionOrder>(`admin/promotion-orders/${id}`),
  updatePromotionOrder: (id: number | string, body: PromotionOrderUpdatePayload) =>
    adminApi<PromotionOrder>(`admin/promotion-orders/${id}`, { method: "PATCH", body }),
  deletePromotionOrder: (id: number | string) =>
    adminApi<{ id: number; deleted: boolean }>(`admin/promotion-orders/${id}`, { method: "DELETE" }),
  financeCommissionRules: (query: PageQuery = {}) => adminApi("admin/finance/commission-rules", { method: "GET", query }),
  createFinanceCommissionRule: (body: Record<string, unknown>) => adminApi("admin/finance/commission-rules", { method: "POST", body }),
  financeReport: (query: PageQuery = {}) => adminApi("admin/finance/report", { method: "GET", query }),
  financeOrders: (query: AdminListQuery = {}) => list("admin/finance/orders", query),
  financeWithdrawals: (query: AdminListQuery = {}) => list("admin/finance/withdrawals", query),
  financeLedger: (query: AdminListQuery = {}) => list("admin/finance/ledger", query),
  vipMembers: (query: AdminListQuery = {}) => list("admin/members/vip", query),
  updateProductCommissionRule: (productId: number | string, body: Record<string, unknown>) => adminApi(`admin/finance/product-commission-rules/${productId}`, { method: "POST", body }),
  settleFinanceOrder: (orderId: number | string, body: Record<string, unknown> = {}) => adminApi(`admin/finance/orders/${orderId}/settle`, { method: "POST", body }),
  refundFinanceOrder: (orderId: number | string, body: Record<string, unknown>) => adminApi(`admin/finance/orders/${orderId}/refund`, { method: "POST", body }),
  releaseCommissionEntry: (entryId: number | string, body: Record<string, unknown> = {}) => adminApi(`admin/finance/commission-entries/${entryId}/release`, { method: "POST", body }),
  reviewWithdrawal: (withdrawalId: number | string, body: Record<string, unknown>) => adminApi(`admin/finance/withdrawals/${withdrawalId}`, { method: "PATCH", body }),
  // ─── 分派配置（总店红娘后台） ─────────────────────────────────────
  apportionConfigs: () => adminApi<ApportionConfig[]>("admin/matchmaker/apportion-config"),
  apportionConfig: (scope: ApportionScope, configType: ApportionConfigType) =>
    adminApi<ApportionConfig>(`admin/matchmaker/apportion-config/${scope}/${configType}`),
  upsertApportionAssign: (scope: ApportionScope, body: Record<string, unknown>) =>
    adminApi(`admin/matchmaker/apportion-config/${scope}/assign`, { method: "PUT", body }),
  upsertApportionAbandon: (scope: ApportionScope, body: Record<string, unknown>) =>
    adminApi(`admin/matchmaker/apportion-config/${scope}/abandon`, { method: "PUT", body }),
  toggleApportionConfig: (scope: ApportionScope, configType: ApportionConfigType, body: { is_enabled: boolean; remark?: string }) =>
    adminApi(`admin/matchmaker/apportion-config/${scope}/${configType}/toggle`, { method: "PATCH", body }),
  apportionAuditLogs: (query: PageQuery & { scope?: ApportionScope; config_type?: ApportionConfigType } = {}) =>
    adminApi("admin/matchmaker/apportion-config/audit-log", { method: "GET", query }),

  // ─── 服务红娘分成级别 ────────────────────────────────────────
  commissionLevels: () => adminApi<CommissionLevel[]>("admin/commission-levels"),
  commissionLevel: (levelId: number) =>
    adminApi<CommissionLevel>(`admin/commission-levels/${levelId}`),
  updateCommissionLevel: (levelId: number, body: CommissionLevelUpdatePayload) =>
    adminApi<CommissionLevel>(`admin/commission-levels/${levelId}`, { method: "PUT", body }),

  // ─── 红娘线上分成明细 ──────────────────────────────────
  commissionEntryList: (query: CommissionEntryListQuery = {}) =>
    adminApi<CommissionEntryDetailPage>("admin/finance/commission-entries", { method: "GET", query }),
  commissionEntryOptions: () =>
    adminApi<CommissionEntryDetailOptions>("admin/finance/commission-entries/options"),

  // ─── 推广红娘管理（推广体系独立于总店服务红娘） ─────────────
  promoterStaffList: (query: PromoterListQuery = {}) =>
    adminApi<PromoterStaffPage>("admin/promoters", {
      method: "GET",
      // visible 为布尔开关，query 序列化统一转 1/0（后端按 bool 解析）
      query: {
        ...query,
        visible: query.visible === undefined ? undefined : query.visible ? 1 : 0,
      } as Record<string, string | number | undefined>,
    }),
  promoterUserCandidates: (keyword: string) =>
    adminApi<PromoterUserCandidate[]>("admin/promoters/user-candidates", { method: "GET", query: { keyword } }),
  createPromoterStaff: (body: PromoterCreatePayload) =>
    adminApi<PromoterStaffDetail>("admin/promoters", { method: "POST", body }),
  promoterStaff: (userId: number) =>
    adminApi<PromoterStaffDetail>(`admin/promoters/${userId}`),
  updatePromoterStaff: (userId: number, body: PromoterUpdatePayload) =>
    adminApi<PromoterStaffDetail>(`admin/promoters/${userId}`, { method: "PUT", body }),
  updatePromoterStatus: (userId: number, body: { status: 1 | 2; reason?: string | null }) =>
    adminApi<PromoterStaffDetail>(`admin/promoters/${userId}/status`, { method: "PATCH", body }),
  promoterStatistics: () =>
    adminApi<PromoterStatistics>("admin/promoters/statistics", { method: "GET" }),
  promoterTeams: () =>
    adminApi<PromoterTeamItem[]>("admin/promoters/teams", { method: "GET" }),
  promoterPlatformToken: (userId: number) =>
    adminApi<PromoterPlatformTokenResponse>(`admin/promoters/${userId}/platform-token`, { method: "POST" }),
  promoterPoster: (userId: number) =>
    adminApi<PromoterPosterResponse>(`admin/promoters/${userId}/poster`, { method: "POST" }),
  updatePromoterTeam: (userId: number, body: PromoterTeamUpdatePayload) =>
    adminApi<PromoterStaffDetail>(`admin/promoters/${userId}/team`, { method: "PUT", body }),
  deletePromoterStaff: (userId: number) =>
    adminApi<{ id: number; deleted: boolean }>(`admin/promoters/${userId}`, { method: "DELETE" }),

  // ─── 推广红娘分成配置（4 固定级别） ──────────────────────
  promoterLevelList: () =>
    adminApi<PromoterLevelPage>("admin/promoter-levels"),
  promoterLevel: (levelId: 1 | 2 | 3 | 4) =>
    adminApi<PromoterLevelItem>(`admin/promoter-levels/${levelId}`),
  updatePromoterLevel: (levelId: 1 | 2 | 3 | 4, body: PromoterLevelUpdatePayload) =>
    adminApi<PromoterLevelItem>(`admin/promoter-levels/${levelId}`, { method: "PUT", body }),

  // ─── 推广红娘线上分成明细 ─────────────────────────────
  promoterCommissionEntries: (query: PromoterCommissionEntryListQuery = {}) =>
    adminApi<PromoterCommissionEntryPage>("admin/promoters/commission-entries", { method: "GET", query }),
  promoterCommissionEntryOptions: () =>
    adminApi<PromoterCommissionEntryOptions>("admin/promoters/commission-entries/options", { method: "GET" }),

  // ─── 服务红娘管理（总店） ─────────────────────────────────────
  matchmakerStaffList: (query: MatchmakerStaffListQuery = {}) =>
    adminApi<MatchmakerStaffPage>("admin/matchmakers", { method: "GET", query: query as Record<string, string | number | undefined> }),
  matchmakerStaff: (id: number | string) =>
    adminApi<MatchmakerStaffDetail>(`admin/matchmakers/${id}`),
  matchmakerUserCandidates: (keyword: string) =>
    adminApi<MatchmakerUserCandidate[]>("admin/matchmakers/user-candidates", { method: "GET", query: { keyword } }),
  createMatchmakerStaff: (body: MatchmakerStaffCreatePayload) =>
    adminApi<MatchmakerStaffDetail>("admin/matchmakers", { method: "POST", body }),
  // 后端该端点为 PUT（非 PATCH），故不使用文件内的 update 辅助函数
  updateMatchmakerStaff: (id: number | string, body: MatchmakerStaffUpdatePayload) =>
    adminApi<MatchmakerStaffDetail>(`admin/matchmakers/${id}`, { method: "PUT", body }),
  deleteMatchmakerStaff: (id: number | string) =>
    adminApi<{ id: number; deleted: boolean }>(`admin/matchmakers/${id}`, { method: "DELETE" }),
  updateMatchmakerLock: (id: number | string, body: { locked: boolean }) =>
    adminApi<MatchmakerStaffDetail>(`admin/matchmakers/${id}/lock`, { method: "PATCH", body }),
  updateMatchmakerVisibility: (id: number | string, body: { visible: boolean }) =>
    adminApi<MatchmakerStaffDetail>(`admin/matchmakers/${id}/visibility`, { method: "PATCH", body }),
  matchmakerTutorial: () =>
    adminApi<MatchmakerTutorial>("admin/matchmakers/tutorial"),
  adminMenuTree: () =>
    adminApi<AdminMenuNode[]>("admin/menus/tree"),
  matchmakerPermissions: (id: number | string) =>
    adminApi<MatchmakerPermissions>(`admin/matchmakers/${id}/permissions`),
  updateMatchmakerPermissions: (id: number | string, body: MatchmakerPermissionsUpdatePayload) =>
    adminApi<MatchmakerPermissions>(`admin/matchmakers/${id}/permissions`, { method: "PUT", body }),
  matchmakerWorkReport: (id: number | string, query: { from?: string; to?: string } = {}) =>
    adminApi<MatchmakerWorkReport>(`admin/matchmakers/${id}/work-report`, { method: "GET", query }),
  matchmakerDetailReport: (id: number | string, query: { from?: string; to?: string } = {}) =>
    adminApi<MatchmakerDetailReport>(`admin/matchmakers/${id}/report`, { method: "GET", query }),
  matchmakerPoster: (id: number | string) =>
    adminApi<MatchmakerPosterResponse>(`admin/matchmakers/${id}/poster`, { method: "POST" }),
  matchmakerPlatformToken: (id: number | string) =>
    adminApi<MatchmakerPlatformTokenResponse>(`admin/matchmakers/${id}/platform-token`, { method: "POST" }),
  dictCommissionLevels: () =>
    adminApi<CommissionLevelDictItem[]>("admin/dict/commission-levels"),
  dictStores: () =>
    adminApi<StoreDictItem[]>("admin/dict/stores"),

  // ─── 分店管理（M5）：分站/门店 CRUD ──────────────────────
  storeList: (query: AdminListQuery = {}) =>
    adminApi<StoreAdminPage>("admin/matchmaker/stores", { method: "GET", query }),
  createStore: (body: StoreAdminCreatePayload) =>
    adminApi<StoreAdminItem>("admin/matchmaker/stores", { method: "POST", body }),
  updateStoreAdmin: (id: number | string, body: StoreAdminUpdatePayload) =>
    adminApi<StoreAdminItem>(`admin/matchmaker/stores/${id}`, { method: "PATCH", body }),
  deleteStore: (id: number | string) =>
    adminApi<StoreAdminItem>(`admin/matchmaker/stores/${id}`, { method: "DELETE" }),
  storeReportSummary: (id: number | string) =>
    adminApi<StoreReportSummary>(`admin/matchmaker/stores/${id}/report/summary`, { method: "GET" }),
  storeReportMonthly: (id: number | string, months = 6) =>
    adminApi<StoreReportMonthly>(`admin/matchmaker/stores/${id}/report/monthly`, { method: "GET", query: { months } }),

  // ─── 分店管理（M5）：分店线上分成明细 ────────────────────
  storeCommissionEntries: (query: StoreCommissionEntryQuery = {}) =>
    adminApi<StoreCommissionEntryPage>("admin/finance/store-commission-entries", { method: "GET", query }),
  storeCommissionOptions: () =>
    adminApi<StoreCommissionOptions>("admin/finance/store-commission-entries/options", { method: "GET" }),
  storeCommissionSummary: (storeId?: number) =>
    adminApi<StoreCommissionSummary>("admin/finance/store-commission-summary", { method: "GET", query: { store_id: storeId } }),
  exportStoreCommissionEntries: (query: StoreCommissionEntryQuery = {}) =>
    downloadAdminFile("admin/finance/store-commission-entries/export", "分店分成明细.xlsx", {
      store_id: query.store_id,
      matchmaker_id: query.matchmaker_id,
      rule_id: query.rule_id,
      start_date: query.start_date,
      end_date: query.end_date,
    }),

  // ─── 合伙红娘（M6）：合伙人管理 ──────────────────────────
  partnerList: (query: PartnerStaffListQuery = {}) =>
    adminApi<PartnerStaffPage>("admin/partners", { method: "GET", query }),
  partnerStatistics: () =>
    adminApi<PartnerStatistics>("admin/partners/statistics"),
  partnerUserCandidates: (keyword: string, limit = 10) =>
    adminApi<PartnerUserCandidate[]>("admin/partners/user-candidates", { method: "GET", query: { keyword, limit } }),
  partnerTeamOptions: () =>
    adminApi<PartnerTeamOption[]>("admin/partners/team-options"),
  createPartner: (body: PartnerStaffCreatePayload) =>
    adminApi<PartnerStaffDetail>("admin/partners", { method: "POST", body }),
  partnerDetail: (teamId: number | string) =>
    adminApi<PartnerStaffDetail>(`admin/partners/${teamId}`),
  updatePartner: (teamId: number | string, body: PartnerStaffUpdatePayload) =>
    adminApi<PartnerStaffDetail>(`admin/partners/${teamId}`, { method: "PUT", body }),
  deletePartner: (teamId: number | string) =>
    adminApi<{ team_id: number; status: number; removed_members: number }>(`admin/partners/${teamId}`, { method: "DELETE" }),

  // ─── 合伙红娘（M6）：团队关系 ────────────────────────────
  partnerRelations: (query: { page?: number; page_size?: number; team_id?: number; keyword?: string; status?: 1 | 2 | 3 } = {}) =>
    adminApi<PartnerRelationPage>("admin/partner-relations", { method: "GET", query }),
  bindPartnerRelation: (body: PartnerRelationBindPayload) =>
    adminApi<PartnerRelationResult>("admin/partner-relations", { method: "POST", body }),
  removePartnerRelation: (relationId: number | string, reason: string) =>
    adminApi<PartnerRelationResult>(`admin/partner-relations/${relationId}/remove`, { method: "POST", body: { reason } }),

  // ─── 合伙红娘（M6）：分成明细 ────────────────────────────
  partnerCommissionEntries: (query: PartnerCommissionEntryQuery = {}) =>
    adminApi<PartnerCommissionEntryPage>("admin/partners/commission-entries", { method: "GET", query }),
  partnerCommissionOptions: () =>
    adminApi<PartnerCommissionOptions>("admin/partners/commission-entries/options"),
  createPartnerCommissionEntry: (body: PartnerCommissionEntryCreatePayload) =>
    adminApi<PartnerCommissionEntryCreateResult>("admin/partners/commission-entries", { method: "POST", body }),

  // ─── 合伙红娘（M6）：分成配置（3 固定级别） ───────────────
  partnerLevelList: () =>
    adminApi<PartnerLevelPage>("admin/partner-levels"),
  partnerLevel: (levelId: PartnerLevelId) =>
    adminApi<PartnerLevelItem>(`admin/partner-levels/${levelId}`),
  updatePartnerLevel: (levelId: PartnerLevelId, body: PartnerLevelUpdatePayload) =>
    adminApi<PartnerLevelItem>(`admin/partner-levels/${levelId}`, { method: "PUT", body }),

  // ─── 会员资料媒体验证（M3-2） ──────────────────────────────
  memberMediaIntros: (query: MemberIntroQuery = {}) =>
    adminApi<MemberIntroPage>("admin/members/media/intros", { method: "GET", query }),
  updateMemberIntro: (userId: number | string, body: { self_intro: string }) =>
    adminApi<MemberIntroItem>(`admin/members/media/intros/${userId}`, { method: "PUT", body }),
  memberMediaList: (query: MemberMediaQuery) =>
    adminApi<MemberMediaPage>("admin/members/media", { method: "GET", query }),
  memberMediaHistory: (userId: number | string, query: { page?: number; page_size?: number } = {}) =>
    adminApi<MemberMediaPage>(`admin/members/media/${userId}/history`, { method: "GET", query }),
  reviewMemberMedia: (id: number | string, body: MemberMediaReviewPayload) =>
    update(`admin/members/media/${id}`, body),
  replaceMemberMedia: (id: number | string, body: MemberMediaReplacePayload) =>
    adminApi(`admin/members/media/${id}`, { method: "PUT", body }),
  deleteMemberMedia: (id: number | string) =>
    adminApi<void>(`admin/members/media/${id}`, { method: "DELETE" }),

  // ─── 会员认证（M3-1） ──────────────────────────────────────
  memberAuthRealnameReviews: (query: { page?: number; page_size?: number; status?: string; keyword?: string } = {}) =>
    adminApi<RealnameReviewPage>("admin/members/auth/realname-reviews", { method: "GET", query }),
  memberAuthRealnameStats: () =>
    adminApi<RealnameStats>("admin/members/auth/realname-stats"),
  memberAuthCommitmentReviews: (query: { page?: number; page_size?: number; status?: string; keyword?: string } = {}) =>
    adminApi<CommitmentReviewPage>("admin/members/auth/commitment-reviews", { method: "GET", query }),
  memberAuthMarriageReviews: (query: { page?: number; page_size?: number; status?: string; keyword?: string } = {}) =>
    adminApi<MarriageReviewPage>("admin/members/auth/marriage-reviews", { method: "GET", query }),
  memberAuthMarriageStats: () =>
    adminApi<MarriageStats>("admin/members/auth/marriage-stats"),
  memberAuthHouseReviews: (query: { page?: number; page_size?: number; status?: string; keyword?: string } = {}) =>
    adminApi<HouseReviewPage>("admin/members/auth/house-reviews", { method: "GET", query }),
  memberAuthEducationReviews: (query: { page?: number; page_size?: number; status?: string; keyword?: string } = {}) =>
    adminApi<EducationReviewPage>("admin/members/auth/education-reviews", { method: "GET", query }),
  memberAuthOtherReviews: (query: { page?: number; page_size?: number; status?: string; keyword?: string; auth_type_id?: number } = {}) =>
    adminApi<OtherReviewPage>("admin/members/auth/other-reviews", { method: "GET", query }),
  memberAuthReview: (kind: MemberAuthKind, id: number | string, body: { status: number; remark?: string }) =>
    update(`admin/members/auth/${kind}/${id}`, body),
  memberAuthDeleteReview: (kind: MemberAuthKind, id: number | string) =>
    adminApi<void>(`admin/members/auth/${kind}/${id}`, { method: "DELETE" }),
  memberAuthTypes: (keyword?: string) =>
    adminApi<AuthTypeItem[]>("admin/members/auth/types", { method: "GET", query: keyword ? { keyword } : {} }),
  memberAuthCreateType: (body: AuthTypePayload) =>
    adminApi<AuthTypeItem>("admin/members/auth/types", { method: "POST", body }),
  memberAuthUpdateType: (id: number | string, body: AuthTypePayload) =>
    adminApi<AuthTypeItem>(`admin/members/auth/types/${id}`, { method: "PUT", body }),
  memberAuthDeleteType: (id: number | string) =>
    adminApi<void>(`admin/members/auth/types/${id}`, { method: "DELETE" }),
  memberAuthConfig: () =>
    adminApi<ConfigSnapshot<Dict>>("admin/configs/member_auth"),
  memberAuthConfigUpdate: (body: { version: number; config: Dict; change_summary: string }) =>
    adminApi<ConfigSnapshot<Dict>>("admin/configs/member_auth", { method: "PATCH", body }),

  // ─── 线上行为（M3-3） ──────────────────────────────────────
  memberBehaviorEvents: (
    query: {
      page?: number;
      page_size?: number;
      category?: MemberBehaviorCategory;
      search?: string;
      min_times?: number;
      status?: number;
      pay_status?: number;
    } = {},
  ) => adminApi<MemberBehaviorPage>("admin/members/behavior-events", { method: "GET", query }),
  deleteMemberBehaviorEvent: (category: "superlike" | "gift" | "report", eventId: number | string) =>
    adminApi<{ id: number; deleted: boolean }>(`admin/members/behavior-events/${category}/${eventId}`, {
      method: "DELETE",
    }),

  // ─── 会员跟进全览与导入（M3-5） ──────────────────────────────
  memberFollowUpList: (
    query: { page?: number; page_size?: number; keyword?: string; intention_level?: number; start_date?: string; end_date?: string } = {},
  ) => adminApi<MemberFollowUpListPage>("admin/members/follow-ups", { method: "GET", query }),
  memberFollowUpSummary: () =>
    adminApi<MemberFollowUpSummary>("admin/members/follow-ups/summary", { method: "GET" }),
  memberFollowUpImport: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return adminApi<MemberFollowUpImportResult>("admin/members/follow-ups/import", { method: "POST", body: form });
  },

  // ─── 线下VIP会员服务（M3-6） ────────────────────────────────
  offlineVipList: (
    query: {
      page?: number;
      page_size?: number;
      progress?: OfflineVipProgress;
      sales_matchmaker_id?: number;
      service_matchmaker_id?: number;
      promoter_id?: number;
      sign_start?: string;
      sign_end?: string;
      keyword?: string;
    } = {},
  ) => adminApi<OfflineVipPage>("admin/offline-vips", { method: "GET", query }),
  offlineVipStatistics: () =>
    adminApi<OfflineVipStatistics>("admin/offline-vips/statistics", { method: "GET" }),
  offlineVipOptions: () =>
    adminApi<OfflineVipOptions>("admin/offline-vips/options", { method: "GET" }),
  createOfflineVip: (body: OfflineVipCreatePayload) =>
    adminApi<OfflineVipItem>("admin/offline-vips", { method: "POST", body }),
  offlineVip: (id: number | string) =>
    adminApi<OfflineVipItem>(`admin/offline-vips/${id}`, { method: "GET" }),
  updateOfflineVip: (id: number | string, body: OfflineVipUpdatePayload) =>
    adminApi<OfflineVipItem>(`admin/offline-vips/${id}`, { method: "PUT", body }),
  offlineVipMeetLogs: (id: number | string, query: { page?: number; page_size?: number } = {}) =>
    adminApi<OfflineVipMeetLogPage>(`admin/offline-vips/${id}/meet-logs`, { method: "GET", query }),
};

/**
 * 下载「历史跟进」导入模板。
 * 该接口返回二进制 xlsx（非 JSON），adminApi 无法直接消费，故在 api 层单独处理：
 * 携带后台 token 拉取 Blob 后触发浏览器下载。
 */
export async function downloadMemberFollowUpTemplate(): Promise<void> {
  const url = new URL(
    "/api/v1/admin/members/follow-ups/import-template",
    process.env.NEXT_PUBLIC_ADMIN_API_BASE_URL || window.location.origin,
  );
  const token = getAdminToken();
  const response = await fetch(url, {
    headers: token ? { authorization: `Bearer ${token}` } : undefined,
  });
  if (!response.ok) {
    throw new Error((await response.text()) || `模板下载失败 (${response.status})`);
  }
  const blob = await response.blob();
  const objectUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = "follow-up-import-template.xlsx";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(objectUrl);
}
