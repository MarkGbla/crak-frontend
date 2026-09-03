/**
 * Typed, server-friendly client for the existing CRAK FastAPI service.
 * Financial reads deliberately bypass caching; callers supply a Clerk token.
 */

export type Money = { currency: "SLE" | "USD" | string; value: number; display: string };
export type Page<T> = { items: T[]; next_cursor: string | null; has_more: boolean };
export type BusinessRole = "viewer" | "member" | "admin" | "owner";
export type ReferralStatus = "draft" | "active" | "paused" | "closed";

export type Business = {
  id: string;
  name: string;
  slug: string;
  status: "provisioning" | "active" | "suspended" | "provision_failed" | string;
  currency: string;
  role?: BusinessRole;
  wallet_ready?: boolean;
  created_at: string;
};

export type Referral = {
  id: string;
  business_id: string;
  code: string;
  name: string;
  description: string | null;
  status: ReferralStatus;
  currency: string;
  balance: Money;
  default_reward_amount: number | null;
  created_at: string;
};

export type Reward = {
  id: string;
  business_id: string;
  referral_id: string;
  reference: string;
  status: "reserved" | "paying" | "paid" | "failed" | "reversed" | string;
  amount: Money;
  destination_type: "momo" | "bank";
  destination_provider_id: string;
  destination_account: string;
  recipient_name: string | null;
  created_at: string;
};

export type FundingIntent = {
  id: string;
  business_id: string;
  reference: string;
  method: "ussd" | "payment_link";
  status: "pending" | "awaiting_payment" | "completed" | "expired" | "cancelled" | "failed" | string;
  amount: Money;
  ussd_code: string | null;
  payment_url: string | null;
  expires_at: string | null;
  created_at: string;
};

export class CrakApiError extends Error {
  constructor(public status: number, public details: unknown) {
    super(`CRAK API request failed (${status})`);
  }
}

type ApiOptions = Omit<RequestInit, "body"> & {
  token: string;
  body?: unknown;
  idempotencyKey?: string;
};

const baseUrl = process.env.CRAK_API_URL ?? process.env.NEXT_PUBLIC_CRAK_API_URL ?? "http://localhost:8000";

async function request<T>(path: string, options: ApiOptions): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Authorization", `Bearer ${options.token}`);
  headers.set("Accept", "application/json");
  if (options.body !== undefined) headers.set("Content-Type", "application/json");
  if (options.idempotencyKey) headers.set("Idempotency-Key", options.idempotencyKey);

  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    cache: "no-store",
  });

  if (!response.ok) {
    const details = await response.json().catch(() => response.statusText);
    throw new CrakApiError(response.status, details);
  }
  return response.json() as Promise<T>;
}

const businessQuery = (businessId: string) => `business_id=${encodeURIComponent(businessId)}`;

export const crakApi = {
  me: (token: string) => request<{ id: string; clerk_user_id: string }>('/v1/me', { token }),
  businesses: (token: string) => request<Business[]>('/v1/businesses', { token }),
  createBusiness: (token: string, body: { name: string; slug?: string; currency?: "SLE" | "USD" }) =>
    request<Business>('/v1/businesses', { token, method: "POST", body }),
  wallet: (token: string, businessId: string) => request<{ business_id: string; currency: string; available: Money; allocated: Money; in_flight: Money; total: Money; wallet_ready: boolean }>(`/v1/businesses/${businessId}/wallet`, { token }),
  walletStatement: (token: string, businessId: string, before?: string) =>
    request<Page<unknown>>(`/v1/businesses/${businessId}/wallet/statement${before ? `?before=${encodeURIComponent(before)}` : ""}`, { token }),
  referrals: (token: string, businessId: string, before?: string) =>
    request<Page<Referral>>(`/v1/referrals?${businessQuery(businessId)}${before ? `&before=${encodeURIComponent(before)}` : ""}`, { token }),
  createReferral: (token: string, businessId: string, body: { code: string; name: string; description?: string; default_reward_amount?: number; activate?: boolean }) =>
    request<Referral>(`/v1/referrals?${businessQuery(businessId)}`, { token, method: "POST", body }),
  updateReferralStatus: (token: string, businessId: string, referralId: string, status: ReferralStatus) =>
    request<Referral>(`/v1/referrals/${referralId}/status?${businessQuery(businessId)}`, { token, method: "PATCH", body: { status } }),
  fundWallet: (token: string, businessId: string, body: { method: "ussd" | "payment_link"; amount: number; reference: string; customer_name?: string }, idempotencyKey: string) =>
    request<FundingIntent>(`/v1/businesses/${businessId}/funding`, { token, method: "POST", body, idempotencyKey }),
  fundingIntents: (token: string, businessId: string) => request<Page<FundingIntent>>(`/v1/businesses/${businessId}/funding`, { token }),
  allocate: (token: string, businessId: string, referralId: string, body: { amount: number; reference: string; note?: string }, idempotencyKey: string) =>
    request<unknown>(`/v1/referrals/${referralId}/allocations?${businessQuery(businessId)}`, { token, method: "POST", body, idempotencyKey }),
  release: (token: string, businessId: string, referralId: string, body: { amount: number; reference: string; note?: string }, idempotencyKey: string) =>
    request<unknown>(`/v1/referrals/${referralId}/releases?${businessQuery(businessId)}`, { token, method: "POST", body, idempotencyKey }),
  rewards: (token: string, businessId: string) => request<Page<Reward>>(`/v1/rewards?${businessQuery(businessId)}`, { token }),
  createReward: (token: string, businessId: string, referralId: string, body: { reference: string; destination_type: "momo" | "bank"; destination_provider_id: string; destination_account: string; amount?: number; recipient_name?: string }, idempotencyKey: string) =>
    request<Reward>(`/v1/referrals/${referralId}/rewards?${businessQuery(businessId)}`, { token, method: "POST", body, idempotencyKey }),
  apiKeys: (token: string, businessId: string) => request<unknown[]>(`/v1/businesses/${businessId}/api-keys`, { token }),
  createApiKey: (token: string, businessId: string, body: { name: string; role: BusinessRole }) => request<unknown>(`/v1/businesses/${businessId}/api-keys`, { token, method: "POST", body }),
  revokeApiKey: (token: string, businessId: string, apiKeyId: string) => request<unknown>(`/v1/businesses/${businessId}/api-keys/${apiKeyId}`, { token, method: "DELETE" }),
};
