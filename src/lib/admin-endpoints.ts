import { adminApi } from "@/lib/admin-api";

export type PageQuery = { page?: number; page_size?: number; status?: number | string; keyword?: string };
export type ReviewPayload = { status?: number; reason?: string; result?: string; action?: string; hide_content?: boolean; restore_content?: boolean };
export type AdminListQuery = PageQuery & Record<string, string | number | undefined>;
export type JsonBody = Record<string, unknown>;
export type DashboardQuery = { from?: string; to?: string };

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
  phone: string | null;
  channel: string | null;
  member_count: number;
  touch_count: number;
  status: 1 | 2;
  status_label: "在职" | "离职";
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
  matchmaker_type: PromoterMatchmakerType | null;
  slogan: string | null;
  commission_level_id: 1 | 2 | 3 | 4 | null;
  can_view_lead_follow: boolean;
  can_write_lead_follow: boolean;
  can_view_member_crm_follow: boolean;
}

export type PromoterListQuery = {
  page?: number;
  page_size?: number;
  keyword?: string;
  status?: 1 | 2;
};

export type PromoterCreatePayload = {
  user_id?: number;
  lookup?: string;
  lookup_by?: "nickname" | "phone";
  channel?: string | null;
  intro?: string | null;
  matchmaker_type?: PromoterMatchmakerType | null;
  slogan?: string | null;
  commission_level_id?: 1 | 2 | 3 | 4 | null;
  can_view_lead_follow?: boolean;
  can_write_lead_follow?: boolean;
  can_view_member_crm_follow?: boolean;
};

export type PromoterUpdatePayload = Partial<{
  channel: string | null;
  intro: string | null;
  display_name: string;
  phone: string;
  status: 1 | 2;
  reason: string | null;
  matchmaker_type: PromoterMatchmakerType | null;
  slogan: string | null;
  commission_level_id: 1 | 2 | 3 | 4 | null;
  can_view_lead_follow: boolean;
  can_write_lead_follow: boolean;
  can_view_member_crm_follow: boolean;
}>;

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
export type ApportionStrategy = "designated" | "round_robin_random" | "by_region" | "by_promoter" | "none";

export interface ApportionAssignFields {
  strategy: ApportionStrategy;
  target_matchmaker_id: number | null;
  target_matchmaker_name: string | null;
  round_robin_pool_size: number | null;
  region_strategy: string | null;
  promoter_follow_enabled: boolean;
  remark: string | null;
  updated_at: string;
}
export interface ApportionAbandonFields {
  auto_abandon_days: number;
  daily_pickup_limit: number;
  show_admin_abandoned_in_pool: boolean;
  show_store_abandoned_in_pool: boolean;
  remark: string | null;
  updated_at: string;
}
export interface ApportionConfigPayload {
  scope: ApportionScope;
  config_type: ApportionConfigType;
  enabled: boolean;
  updated_at: string;
  remark: string | null;
  assign?: ApportionAssignFields;
  abandon?: ApportionAbandonFields;
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

export const adminEndpoints = {
  login: (body: { username: string; password: string }) => adminApi<{ access_token: string; refresh_token: string; token_type: "bearer"; expires_in: number; account: Record<string, unknown> }>("admin/matchmaker/auth/login", { method: "POST", body }),
  me: () => adminApi<{ account: Record<string, unknown>; permissions: string[] }>("admin/matchmaker/auth/me"),
  refresh: (body: { refresh_token: string }) => adminApi<{ access_token: string; refresh_token: string; token_type: "bearer"; expires_in: number; account: Record<string, unknown> }>("admin/matchmaker/auth/refresh", { method: "POST", body }),
  logout: () => adminApi<void>("admin/matchmaker/auth/logout", { method: "POST" }),
  bootstrap: () => adminApi<Record<string, unknown>>("admin/bootstrap"),
  dashboard: (query: DashboardQuery = {}) => adminApi<Record<string, unknown>>("admin/dashboard", { method: "GET", query }),
  memberStatistics: (query: DashboardQuery = {}) => adminApi<Record<string, unknown>>("admin/member-statistics", { method: "GET", query }),
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
  meetingRequests: (query: AdminListQuery = {}) => list("admin/matchmaker/meetings/requests", query),
  meetings: (query: AdminListQuery = {}) => list("admin/matchmaker/meetings", query),
  meeting: (id: number | string) => adminApi(`admin/matchmaker/meetings/${id}`),
  updateMeeting: (id: number | string, body: JsonBody) => update(`admin/matchmaker/meetings/${id}`, body),
  meetingFeedback: (id: number | string) => adminApi<Record<string, unknown>[]>(`admin/matchmaker/meetings/${id}/feedback`),
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
  apportionConfigs: () => adminApi<ApportionConfigPayload[]>("admin/matchmaker/apportion-config"),
  apportionConfig: (scope: ApportionScope, configType: ApportionConfigType) =>
    adminApi<ApportionConfigPayload>(`admin/matchmaker/apportion-config/${scope}/${configType}`),
  upsertApportionAssign: (scope: ApportionScope, body: Record<string, unknown>) =>
    adminApi(`admin/matchmaker/apportion-config/${scope}/assign`, { method: "PUT", body }),
  upsertApportionAbandon: (scope: ApportionScope, body: Record<string, unknown>) =>
    adminApi(`admin/matchmaker/apportion-config/${scope}/abandon`, { method: "PUT", body }),
  toggleApportionConfig: (scope: ApportionScope, configType: ApportionConfigType, body: { enabled: boolean }) =>
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
    adminApi<PromoterStaffPage>("admin/promoters", { method: "GET", query }),
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

  // ─── 推广红娘分成配置（4 固定级别） ──────────────────────
  promoterLevelList: () =>
    adminApi<PromoterLevelPage>("admin/promoter-levels"),
  promoterLevel: (levelId: 1 | 2 | 3 | 4) =>
    adminApi<PromoterLevelItem>(`admin/promoter-levels/${levelId}`),
  updatePromoterLevel: (levelId: 1 | 2 | 3 | 4, body: PromoterLevelUpdatePayload) =>
    adminApi<PromoterLevelItem>(`admin/promoter-levels/${levelId}`, { method: "PUT", body }),
};
