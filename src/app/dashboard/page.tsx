"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";
import { Gift, Landmark, TrendingUp, UsersRound, WalletCards } from "lucide-react";
import { crakApi, type Referral, type Reward, type Wallet } from "@/lib/crak-api";
import { useDashboardData } from "@/components/dashboard/dashboard-data-provider";
import {
  Alert,
  EmptyState,
  Initials,
  Money,
  Panel,
  PanelLink,
  Row,
  RowSkeleton,
  StatCard,
  StatusBadge,
} from "@/components/ui/dashboard";
import { CardGrid, Page, PageHeader, Split } from "@/components/ui/layout";
import { ButtonLink } from "@/components/ui/button";

export default function DashboardPage() {
  const { business, me } = useDashboardData();
  const { getToken } = useAuth();

  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!business) return;
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Your session could not provide an API token.");
      const [nextWallet, nextRewards, nextReferrals] = await Promise.all([
        crakApi.wallet(token, business.id),
        crakApi.rewards(token, business.id),
        crakApi.referrals(token, business.id),
      ]);
      setWallet(nextWallet);
      setRewards(nextRewards.items);
      setReferrals(nextReferrals.items);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load your workspace.");
    } finally {
      setLoading(false);
    }
  }, [business, getToken]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const paid = rewards.filter((reward) => reward.status === "paid");
  const inFlight = rewards.filter((reward) => ["reserved", "paying"].includes(reward.status));
  const activeCampaigns = referrals.filter((referral) => referral.status === "active");
  // A campaign with no rules accepts conversions and pays nobody. Worth
  // surfacing on the first screen rather than three clicks in.
  const unpriced = referrals.filter(
    (referral) => Object.keys(referral.reward_rules ?? {}).length === 0,
  );

  const firstName = me?.user.email?.split("@")[0] ?? "there";

  return (
    <Page width="wide">
      <PageHeader
        eyebrow="Overview"
        title={`Welcome back, ${firstName}`}
        subtitle="Where your money is, and what it has paid for."
        actions={
          <>
            <ButtonLink href="/dashboard/wallet" variant="outline" size="sm">
              Add funds
            </ButtonLink>
            <ButtonLink href="/dashboard/referrals" variant="primary" size="sm" withArrow>
              New campaign
            </ButtonLink>
          </>
        }
      />

      {error && <Alert>{error}</Alert>}

      {!loading && unpriced.length > 0 && (
        <Alert tone="warn">
          {unpriced.length === 1
            ? `“${unpriced[0].name}” has no reward rules yet, so it cannot pay anyone.`
            : `${unpriced.length} campaigns have no reward rules yet, so they cannot pay anyone.`}{" "}
          <Link href="/dashboard/referrals" className="font-semibold underline">
            Set them up
          </Link>
        </Alert>
      )}

      {/* Summary before detail: four figures answering "where is my money?" */}
      <CardGrid>
        <StatCard
          tone="brand"
          label="Available"
          value={wallet?.available.display ?? "—"}
          hint="Ready to allocate"
          icon={<WalletCards size={17} />}
          loading={loading}
        />
        <StatCard
          label="On campaigns"
          value={wallet?.allocated.display ?? "—"}
          hint={`${activeCampaigns.length} active`}
          icon={<Gift size={17} />}
          loading={loading}
        />
        <StatCard
          label="In flight"
          value={wallet?.in_flight.display ?? "—"}
          hint={`${inFlight.length} being paid`}
          icon={<TrendingUp size={17} />}
          loading={loading}
        />
        <StatCard
          label="Rewards paid"
          value={String(paid.length)}
          hint={paid.length ? "All time" : "Nothing paid yet"}
          icon={<UsersRound size={17} />}
          loading={loading}
        />
      </CardGrid>

      <Split
        aside={
          <>
            <Panel
              title="Campaigns"
              actions={<PanelLink href="/dashboard/referrals">Manage</PanelLink>}
            >
              {loading ? (
                <RowSkeleton rows={3} />
              ) : referrals.length ? (
                referrals.slice(0, 5).map((referral) => (
                  <Row
                    key={referral.id}
                    title={referral.name}
                    meta={<span className="font-mono text-[11px]">{referral.code}</span>}
                    right={
                      <>
                        <Money size="sm">{referral.balance.display}</Money>
                        <StatusBadge
                          status={
                            Object.keys(referral.reward_rules ?? {}).length === 0
                              ? "pending_funds"
                              : referral.status
                          }
                        />
                      </>
                    }
                  />
                ))
              ) : (
                <EmptyState
                  icon={<UsersRound size={20} />}
                  title="No campaigns"
                  body="A campaign holds the budget your rewards are paid from."
                />
              )}
            </Panel>

            <Panel title="Wallet backing">
              <div className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-[var(--brand-50)] text-[var(--brand-700)]">
                    <Landmark size={16} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold">
                      {business?.monime_financial_account_id ? "Connected" : "Provisioning"}
                    </p>
                    <p className="truncate font-mono text-[11px] text-[var(--muted-2)]">
                      {business?.monime_financial_account_id ?? "Setting up your Monime account"}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-[var(--line)] pt-3.5">
                  <span className="text-[12.5px] text-[var(--muted)]">Total held</span>
                  <Money>{wallet?.total.display ?? "—"}</Money>
                </div>
              </div>
            </Panel>
          </>
        }
      >
        <Panel
          title="Recent rewards"
          description="The latest payouts from your campaigns"
          actions={<PanelLink href="/dashboard/rewards">View all</PanelLink>}
        >
          {loading ? (
            <RowSkeleton rows={5} />
          ) : rewards.length ? (
            rewards.slice(0, 7).map((reward) => (
              <Row
                key={reward.id}
                avatar={<Initials name={reward.recipient_name ?? reward.reference} />}
                title={reward.recipient_name ?? reward.reference}
                meta={
                  <>
                    {reward.destination_account}
                    <span className="mx-1.5 opacity-40">·</span>
                    {new Date(reward.created_at).toLocaleDateString()}
                  </>
                }
                right={
                  <>
                    <Money tone={reward.status === "paid" ? "credit" : "plain"}>
                      {reward.amount.display}
                    </Money>
                    <StatusBadge status={reward.status} />
                  </>
                }
              />
            ))
          ) : (
            <EmptyState
              icon={<Gift size={20} />}
              title="No rewards yet"
              body="Once a campaign has rules and a conversion is reported, rewards appear here."
              action={
                <ButtonLink href="/dashboard/referrals" size="sm" withArrow>
                  Set up a campaign
                </ButtonLink>
              }
            />
          )}
        </Panel>
      </Split>
    </Page>
  );
}
