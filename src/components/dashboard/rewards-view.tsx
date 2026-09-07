"use client";

import { useAuth } from "@clerk/nextjs";
import { Gift } from "lucide-react";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { crakApi, type Referral, type Reward } from "@/lib/crak-api";
import { Button } from "@/components/ui/button";
import {
  Alert,
  EmptyState,
  Field,
  Initials,
  Input,
  Money,
  Panel,
  Row,
  RowSkeleton,
  Select,
  StatusBadge,
} from "@/components/ui/dashboard";
import { Page, PageHeader } from "@/components/ui/layout";
import { useDashboardData } from "./dashboard-data-provider";
import { Dialog, DialogActions } from "./dialog";
import { messageFrom, reference, shortDate } from "./view-utils";

export function RewardsLiveView() {
  const { business } = useDashboardData();
  const { getToken } = useAuth();
  const [items, setItems] = useState<Reward[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [open, setOpen] = useState(false);
  const [destinationType, setDestinationType] = useState<"momo" | "bank">("momo");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const activeReferrals = referrals.filter((item) => item.status === "active");
  const canWrite = business?.role !== "viewer";

  const load = useCallback(async () => {
    if (!business) return;
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Your session could not provide an API token.");
      const [rewardsPage, referralsPage] = await Promise.all([
        crakApi.rewards(token, business.id),
        crakApi.referrals(token, business.id),
      ]);
      setItems(rewardsPage.items);
      setReferrals(referralsPage.items);
    } catch (cause) {
      setError(messageFrom(cause, "Unable to load rewards."));
    } finally {
      setLoading(false);
    }
  }, [business, getToken]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!business) return;
    const form = new FormData(event.currentTarget);
    const amount = String(form.get("amount") || "").trim();
    setSubmitting(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Your session could not provide an API token.");
      await crakApi.createReward(
        token,
        business.id,
        String(form.get("referralId")),
        {
          reference: reference("reward"),
          destination_type: destinationType,
          destination_provider_id: String(form.get("providerId")),
          destination_account: String(form.get("account")),
          recipient_name: String(form.get("recipientName") || "") || undefined,
          amount: amount ? Math.round(Number(amount) * 100) : undefined,
        },
        crypto.randomUUID(),
      );
      setOpen(false);
      await load();
    } catch (cause) {
      setError(messageFrom(cause, "Unable to create the reward."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Page>
      <PageHeader
        eyebrow="Live payouts"
        title="Rewards"
        subtitle="Every payout issued from your campaigns."
        actions={
          <Button
            size="sm"
            onClick={() => setOpen(true)}
            disabled={!canWrite || activeReferrals.length === 0}
          >
            <Gift size={15} /> Create reward
          </Button>
        }
      />

      {error && <Alert>{error}</Alert>}
      {!loading && activeReferrals.length === 0 && (
        <Alert tone="warn">
          Create or activate a referral campaign before issuing a reward.
        </Alert>
      )}

      <Panel title="All rewards" description={`${items.length} total`}>
        {loading ? (
          <RowSkeleton rows={6} />
        ) : items.length ? (
          items.map((item) => (
            <Row
              key={item.id}
              avatar={<Initials name={item.recipient_name ?? item.reference} />}
              title={item.recipient_name ?? item.reference}
              meta={
                <>
                  {item.destination_account}
                  <span className="mx-1.5 opacity-40">·</span>
                  {item.destination_provider_id}
                  <span className="mx-1.5 opacity-40">·</span>
                  {shortDate(item.created_at)}
                </>
              }
              right={
                <>
                  <Money tone={item.status === "paid" ? "credit" : "plain"}>
                    {item.amount.display}
                  </Money>
                  <StatusBadge status={item.status} />
                </>
              }
            />
          ))
        ) : (
          <EmptyState
            icon={<Gift size={20} />}
            title="No rewards created yet"
            body="Rewards appear here once a campaign pays someone, whether you issue it here or your app reports a conversion."
          />
        )}
      </Panel>

      {open && (
        <Dialog
          title="Create reward"
          description="Pays a referrer directly from a campaign's balance."
          onClose={() => setOpen(false)}
        >
          <form onSubmit={create} className="flex flex-col gap-4">
            <Field label="Campaign">
              <Select name="referralId" required>
                {activeReferrals.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} · {item.balance.display}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Recipient name">
              <Input name="recipientName" maxLength={120} />
            </Field>
            <Field label="Destination type">
              <Select
                value={destinationType}
                onChange={(event) => setDestinationType(event.target.value as "momo" | "bank")}
              >
                <option value="momo">Mobile money</option>
                <option value="bank">Bank account</option>
              </Select>
            </Field>
            <Field label="Provider">
              <Select name="providerId">
                {destinationType === "momo" ? (
                  <>
                    <option value="m17">Orange Money</option>
                    <option value="m18">Afrimoney</option>
                  </>
                ) : (
                  <>
                    <option value="slb001">Sierra Leone Commercial Bank</option>
                    <option value="slb004">Rokel Commercial Bank</option>
                    <option value="slb007">United Bank for Africa</option>
                  </>
                )}
              </Select>
            </Field>
            <Field label={destinationType === "momo" ? "Phone number" : "Account number"}>
              <Input name="account" required minLength={3} maxLength={64} />
            </Field>
            <Field
              label={`Amount (${business?.currency})`}
              hint="Leave blank to use the campaign default."
            >
              <Input name="amount" min="0.01" step="0.01" type="number" />
            </Field>
            <DialogActions>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Creating…" : "Create reward"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      )}
    </Page>
  );
}
