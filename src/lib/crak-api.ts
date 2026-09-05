/** Typed client for the existing CRAK FastAPI service. */

export type Money = { currency: "SLE" | "USD" | string; value: number; display: string };
export type Page<T> = { items: T[]; next_cursor: string | null; has_more: boolean };
export type BusinessRole = "viewer" | "member" | "admin" | "owner";
export type ReferralStatus = "draft" | "active" | "paused" | "closed";

export type Business = { id: string; name: string; slug: string; status: string; currency: string; role?: BusinessRole; created_at: string };
export type Me = { user: { id: string; clerk_user_id: string; email: string | null; is_active: boolean; created_at: string }; businesses: Business[]; needs_onboarding: boolean };
export type Wallet = { business_id: string; currency: string; available: Money; allocated: Money; in_flight: Money; total: Money; wallet_ready: boolean };
export type LedgerEntry = { id: string; transaction_id: string; amount: number; currency: string; balance_after: number; created_at: string };
export type Referral = { id: string; business_id: string; code: string; name: string; description: string | null; status: ReferralStatus; currency: string; balance: Money; default_reward_amount: number | null; reward_rules: RewardRules; auto_reward: boolean; created_at: string };

/**
 * What a campaign pays for. Shorthand `{ signup: 5000 }` means a flat 5000 minor
 * units; the long form adds conditions and caps. A campaign with `{}` pays for
 * nothing, which is why a referral created without rules never rewards anyone.
 * See docs/rules.md in the backend repo.
 */
export type RewardRule = number | { pays: { fixed: number } | { percent: number; min?: number; max?: number }; when?: RuleCondition; cap?: RuleCap };
export type RuleCondition = { op: ">=" | ">" | "<=" | "<" | "==" | "!="; var: string; value: unknown } | { op: "in"; var: string; value: unknown[] } | { op: "and"; all: RuleCondition[] } | { op: "or"; any: RuleCondition[] } | { op: "not"; rule: RuleCondition };
export type RuleCap = { per?: "referrer" | "campaign"; window?: "day" | "week" | "month" | "all"; amount?: number; count?: number };
export type RewardRules = Record<string, RewardRule>;

export type Referrer = { id: string; business_id: string; external_ref: string; name: string | null; destination_type: "momo" | "bank"; destination_provider_id: string; destination_account: string; status: "active" | "blocked"; created_at: string };

/** `rewarded` is not the only success - nothing is thrown away. */
export type EventStatus = "rewarded" | "pending_review" | "pending_funds" | "rejected";
export type ReferralEvent = { id: string; business_id: string; referral_id: string; referrer_id: string; type: string; external_id: string; status: EventStatus; amount: number | null; awarded: Money | null; rule_key: string | null; reason: string | null; reward_id: string | null; occurred_at: string; created_at: string };
export type Simulation = { outcome: EventStatus; would_pay: number; currency: string; rule_key: string | null; reason: string; referral_balance: number };
export type RulesUpdate = { referral_id: string; code: string; reward_rules: RewardRules; auto_reward: boolean; warnings: string[] };
export type Diagnostics = { referral_id: string; code: string; rule_event_types: string[]; warnings: string[] };
export type RetryPending = { examined: number; paid: number; still_pending: number };

export type IngestSource = { id: string; business_id: string; source: string; name: string; token_hint: string; mapping: Record<string, unknown>; verification: "none" | "hmac_sha256_hex" | "hmac_sha256_base64"; enabled: boolean; delivery_count: number; last_seen_at: string | null; last_error: string | null; created_at: string };
/** `token` and `url` are returned once, at creation, and never again. */
export type CreatedIngestSource = IngestSource & { token: string; url: string };

export type ReconciliationRun = { id: string; business_id: string; status: "ok" | "drift_detected" | "error"; internal_balance: number | null; monime_balance: number | null; drift: number | null; currency: string | null; findings: Record<string, unknown>; created_at: string };
export type Reward = { id: string; business_id: string; referral_id: string; reference: string; status: "reserved" | "paying" | "paid" | "failed" | "reversed" | string; amount: Money; destination_type: "momo" | "bank"; destination_provider_id: string; destination_account: string; recipient_name: string | null; created_at: string };
export type FundingIntent = { id: string; business_id: string; reference: string; method: "ussd" | "payment_link"; status: string; amount: Money; ussd_code: string | null; payment_url: string | null; expires_at: string | null; created_at: string };
export type ApiKey = { id: string; name: string; role: BusinessRole; key_hint: string; last_used_at: string | null; revoked_at: string | null; created_at: string };
export type CreatedApiKey = ApiKey & { key: string };
export type Membership = { id: string; user_id: string; business_id: string; role: BusinessRole; created_at: string };
export type Allocation = { id: string; referral_id: string; direction: "allocate" | "release" | string; amount: Money; ledger_transaction_id: string; note: string | null; created_at: string };

export class CrakApiError extends Error {
  constructor(public status: number, public details: unknown, message: string) {
    super(message);
    this.name = "CrakApiError";
  }
}

function apiErrorMessage(status: number, details: unknown) {
  if (details && typeof details === "object") {
    const body = details as { detail?: string; error?: { message?: string } };
    if (typeof body.error?.message === "string") return body.error.message;
    if (typeof body.detail === "string") return body.detail;
  }
  return `CRAK API request failed (${status})`;
}

type ApiOptions = Omit<RequestInit, "body"> & { token: string; body?: unknown; idempotencyKey?: string };
const baseUrl = process.env.NEXT_PUBLIC_CRAK_API_URL ?? "http://localhost:8000";

async function request<T>(path: string, options: ApiOptions): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Authorization", `Bearer ${options.token}`);
  headers.set("Accept", "application/json");
  if (options.body !== undefined) headers.set("Content-Type", "application/json");
  if (options.idempotencyKey) headers.set("Idempotency-Key", options.idempotencyKey);
  const response = await fetch(`${baseUrl}${path}`, { ...options, headers, body: options.body === undefined ? undefined : JSON.stringify(options.body), cache: "no-store" });
  if (!response.ok) {
    const details: unknown = await response.json().catch(() => response.statusText);
    throw new CrakApiError(response.status, details, apiErrorMessage(response.status, details));
  }
  return response.json() as Promise<T>;
}

function toQuery(params: Record<string, string | undefined>) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) q.set(k, v);
  const s = q.toString();
  return s ? `?${s}` : "";
}

const businessPath = (businessId: string) => `/v1/businesses/${encodeURIComponent(businessId)}`;

export const crakApi = {
  me: (token: string) => request<Me>("/v1/me", { token }),
  createBusiness: (token: string, body: { name: string; slug?: string; currency?: "SLE" | "USD" }) => request<Business>("/v1/businesses", { token, method: "POST", body }),
  wallet: (token: string, businessId: string) => request<Wallet>(`${businessPath(businessId)}/wallet`, { token }),
  walletStatement: (token: string, businessId: string, before?: string) => request<Page<LedgerEntry>>(`${businessPath(businessId)}/wallet/statement${before ? `?before=${encodeURIComponent(before)}` : ""}`, { token }),
  referrals: (token: string, businessId: string, before?: string) => request<Page<Referral>>(`${businessPath(businessId)}/referrals${before ? `?before=${encodeURIComponent(before)}` : ""}`, { token }),
  createReferral: (token: string, businessId: string, body: { code: string; name: string; description?: string; default_reward_amount?: number; reward_rules?: RewardRules; auto_reward?: boolean; activate?: boolean }) => request<Referral>(`${businessPath(businessId)}/referrals`, { token, method: "POST", body }),
  referral: (token: string, businessId: string, referralId: string) => request<Referral>(`${businessPath(businessId)}/referrals/${encodeURIComponent(referralId)}`, { token }),
  updateReferralStatus: (token: string, businessId: string, referralId: string, status: ReferralStatus) => request<Referral>(`${businessPath(businessId)}/referrals/${encodeURIComponent(referralId)}/status`, { token, method: "PATCH", body: { status } }),
  fundWallet: (token: string, businessId: string, body: { method: "ussd" | "payment_link"; amount: number; reference: string; customer_name?: string }, idempotencyKey: string) => request<FundingIntent>(`${businessPath(businessId)}/funding`, { token, method: "POST", body, idempotencyKey }),
  fundingIntents: (token: string, businessId: string) => request<Page<FundingIntent>>(`${businessPath(businessId)}/funding`, { token }),
  fundingIntent: (token: string, businessId: string, fundingId: string) => request<FundingIntent>(`${businessPath(businessId)}/funding/${encodeURIComponent(fundingId)}`, { token }),
  allocate: (token: string, businessId: string, referralId: string, body: { amount: number; reference: string; note?: string }, idempotencyKey: string) => request<Allocation>(`${businessPath(businessId)}/referrals/${encodeURIComponent(referralId)}/allocations`, { token, method: "POST", body, idempotencyKey }),
  release: (token: string, businessId: string, referralId: string, body: { amount: number; reference: string; note?: string }, idempotencyKey: string) => request<Allocation>(`${businessPath(businessId)}/referrals/${encodeURIComponent(referralId)}/releases`, { token, method: "POST", body, idempotencyKey }),
  rewards: (token: string, businessId: string) => request<Page<Reward>>(`${businessPath(businessId)}/rewards`, { token }),
  createReward: (token: string, businessId: string, referralId: string, body: { reference: string; destination_type: "momo" | "bank"; destination_provider_id: string; destination_account: string; amount?: number; recipient_name?: string }, idempotencyKey: string) => request<Reward>(`${businessPath(businessId)}/referrals/${encodeURIComponent(referralId)}/rewards`, { token, method: "POST", body, idempotencyKey }),
  apiKeys: (token: string, businessId: string) => request<ApiKey[]>(`${businessPath(businessId)}/api-keys`, { token }),
  createApiKey: (token: string, businessId: string, body: { name: string; role: BusinessRole }) => request<CreatedApiKey>(`${businessPath(businessId)}/api-keys`, { token, method: "POST", body }),
  revokeApiKey: (token: string, businessId: string, apiKeyId: string) => request<ApiKey>(`${businessPath(businessId)}/api-keys/${encodeURIComponent(apiKeyId)}`, { token, method: "DELETE" }),
  addMember: (token: string, businessId: string, body: { clerk_user_id: string; role: BusinessRole }) => request<Membership>(`${businessPath(businessId)}/members`, { token, method: "POST", body }),

  // ---------------------------------------------------------------- rules
  /** Replace what a campaign pays for. Requires the admin role. */
  setRules: (token: string, businessId: string, referralId: string, body: { reward_rules: RewardRules; auto_reward?: boolean }) => request<RulesUpdate>(`${businessPath(businessId)}/referrals/${encodeURIComponent(referralId)}/rules`, { token, method: "PUT", body }),
  /** Do the rules and the events actually reported agree on their names? */
  diagnostics: (token: string, businessId: string, referralId: string) => request<Diagnostics>(`${businessPath(businessId)}/referrals/${encodeURIComponent(referralId)}/diagnostics`, { token }),

  // ------------------------------------------------------------ referrers
  referrers: (token: string, businessId: string, before?: string) => request<Page<Referrer>>(`${businessPath(businessId)}/referrers${before ? `?before=${encodeURIComponent(before)}` : ""}`, { token }),
  referrer: (token: string, businessId: string, referrerId: string) => request<Referrer>(`${businessPath(businessId)}/referrers/${encodeURIComponent(referrerId)}`, { token }),
  /** Idempotent on external_ref - safe to call repeatedly. */
  upsertReferrer: (token: string, businessId: string, body: { external_ref: string; destination_provider_id: string; destination_account: string; destination_type?: "momo" | "bank"; name?: string }) => request<Referrer>(`${businessPath(businessId)}/referrers`, { token, method: "POST", body }),
  /** Blocking rejects future events without touching what they already earned. */
  setReferrerStatus: (token: string, businessId: string, referrerId: string, status: "active" | "blocked") => request<Referrer>(`${businessPath(businessId)}/referrers/${encodeURIComponent(referrerId)}/status`, { token, method: "PATCH", body: { status } }),

  // --------------------------------------------------------------- events
  events: (token: string, businessId: string, query: { referral_id?: string; referrer_id?: string; type?: string; status?: EventStatus; before?: string } = {}) => request<Page<ReferralEvent>>(`${businessPath(businessId)}/events${toQuery(query)}`, { token }),
  event: (token: string, businessId: string, eventId: string) => request<ReferralEvent>(`${businessPath(businessId)}/events/${encodeURIComponent(eventId)}`, { token }),
  /** What would this pay? Writes nothing, moves nothing. */
  simulateEvent: (token: string, businessId: string, body: { type: string; referral_code: string; referrer_ref?: string; amount?: number; metadata?: Record<string, unknown> }) => request<Simulation>(`${businessPath(businessId)}/events/simulate`, { token, method: "POST", body }),
  approveEvent: (token: string, businessId: string, eventId: string) => request<ReferralEvent>(`${businessPath(businessId)}/events/${encodeURIComponent(eventId)}/approve`, { token, method: "POST" }),
  rejectEvent: (token: string, businessId: string, eventId: string, reason?: string) => request<ReferralEvent>(`${businessPath(businessId)}/events/${encodeURIComponent(eventId)}/reject`, { token, method: "POST", body: { reason } }),
  /** Pay the backlog held for lack of funds, after topping the campaign up. */
  retryPendingEvents: (token: string, businessId: string) => request<RetryPending>(`${businessPath(businessId)}/events/retry-pending`, { token, method: "POST" }),

  // -------------------------------------------------------- ingest sources
  ingestSources: (token: string, businessId: string) => request<IngestSource[]>(`${businessPath(businessId)}/ingest-sources`, { token }),
  /** Returns the paste-me URL exactly once. Requires the admin role. */
  createIngestSource: (token: string, businessId: string, body: { name: string; referral_code: string; source?: string; mapping?: Record<string, unknown>; verification?: IngestSource["verification"]; signing_secret?: string; signature_header?: string }) => request<CreatedIngestSource>(`${businessPath(businessId)}/ingest-sources`, { token, method: "POST", body }),
  disableIngestSource: (token: string, businessId: string, ingestId: string) => request<IngestSource>(`${businessPath(businessId)}/ingest-sources/${encodeURIComponent(ingestId)}`, { token, method: "DELETE" }),
  /** Paste a real webhook body and see what CRAK would read from it. */
  testIngestSource: (token: string, businessId: string, ingestId: string, payload: Record<string, unknown>) => request<{ mapped: Record<string, unknown> | null; error?: string; would?: Simulation }>(`${businessPath(businessId)}/ingest-sources/${encodeURIComponent(ingestId)}/test`, { token, method: "POST", body: { payload } }),

  // ------------------------------------------------------- reconciliation
  reconciliations: (token: string, businessId: string) => request<ReconciliationRun[]>(`${businessPath(businessId)}/reconciliations`, { token }),
};
