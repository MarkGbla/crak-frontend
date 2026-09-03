/** Typed client for the existing CRAK FastAPI service. */

export type Money = { currency: "SLE" | "USD" | string; value: number; display: string };
export type Page<T> = { items: T[]; next_cursor: string | null; has_more: boolean };
export type BusinessRole = "viewer" | "member" | "admin" | "owner";
export type ReferralStatus = "draft" | "active" | "paused" | "closed";

export type Business = { id: string; name: string; slug: string; status: string; currency: string; role?: BusinessRole; created_at: string };
export type Me = { user: { id: string; clerk_user_id: string; email: string | null; is_active: boolean; created_at: string }; businesses: Business[]; needs_onboarding: boolean };
export type Wallet = { business_id: string; currency: string; available: Money; allocated: Money; in_flight: Money; total: Money; wallet_ready: boolean };
export type LedgerEntry = { id: string; transaction_id: string; amount: number; currency: string; balance_after: number; created_at: string };
export type Referral = { id: string; business_id: string; code: string; name: string; description: string | null; status: ReferralStatus; currency: string; balance: Money; default_reward_amount: number | null; created_at: string };
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

const businessPath = (businessId: string) => `/v1/businesses/${encodeURIComponent(businessId)}`;

export const crakApi = {
  me: (token: string) => request<Me>("/v1/me", { token }),
  createBusiness: (token: string, body: { name: string; slug?: string; currency?: "SLE" | "USD" }) => request<Business>("/v1/businesses", { token, method: "POST", body }),
  wallet: (token: string, businessId: string) => request<Wallet>(`${businessPath(businessId)}/wallet`, { token }),
  walletStatement: (token: string, businessId: string, before?: string) => request<Page<LedgerEntry>>(`${businessPath(businessId)}/wallet/statement${before ? `?before=${encodeURIComponent(before)}` : ""}`, { token }),
  referrals: (token: string, businessId: string, before?: string) => request<Page<Referral>>(`${businessPath(businessId)}/referrals${before ? `?before=${encodeURIComponent(before)}` : ""}`, { token }),
  createReferral: (token: string, businessId: string, body: { code: string; name: string; description?: string; default_reward_amount?: number; activate?: boolean }) => request<Referral>(`${businessPath(businessId)}/referrals`, { token, method: "POST", body }),
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
};
