"use client";

import { useAuth } from "@clerk/nextjs";
import { ExternalLink, Plus, RefreshCw, TrendingUp, WalletCards } from "lucide-react";
import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  crakApi,
  type FundingIntent,
  type LedgerEntry,
  type Wallet,
} from "@/lib/crak-api";
import { Button } from "@/components/ui/button";
import {
  Alert,
  EmptyState,
  Field,
  Input,
  Money,
  Panel,
  Row,
  RowSkeleton,
  Select,
  StatCard,
  StatusBadge,
} from "@/components/ui/dashboard";
import { CardGrid, Page, PageHeader, Split } from "@/components/ui/layout";
import { useDashboardData } from "./dashboard-data-provider";
import { Dialog, DialogActions } from "./dialog";
import { formatMinor, messageFrom, reference, shortDate } from "./view-utils";

export function WalletLiveView() {
  const { business } = useDashboardData();
  const { getToken } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [funding, setFunding] = useState<FundingIntent[]>([]);
  const [result, setResult] = useState<FundingIntent | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canWrite = business?.role !== "viewer";
  const load = useCallback(async () => {
    if (!business) return;
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Your session could not provide an API token.");
      const [nextWallet, statement, intents] = await Promise.all([
        crakApi.wallet(token, business.id),
        crakApi.walletStatement(token, business.id),
        crakApi.fundingIntents(token, business.id),
      ]);
      setWallet(nextWallet);
      setEntries(statement.items);
      setFunding(intents.items);
    } catch (cause) {
      setError(messageFrom(cause, "Unable to load wallet data."));
    } finally {
      setLoading(false);
    }
  }, [business, getToken]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  useEffect(() => {
    if (!business || !result || !["pending", "processing"].includes(result.status)) return;
    const timer = window.setTimeout(async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const updated = await crakApi.fundingIntent(token, business.id, result.id);
        setResult(updated);
        setFunding((current) => [updated, ...current.filter((item) => item.id !== updated.id)]);
        if (!["pending", "processing"].includes(updated.status)) await load();
      } catch {
        // The regular refresh action remains available if polling is interrupted.
      }
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [business, getToken, load, result]);

  async function fund(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!business) return;
    const form = new FormData(event.currentTarget);
    setSubmitting(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Your session could not provide an API token.");
      const created = await crakApi.fundWallet(
        token,
        business.id,
        {
          amount: Math.round(Number(form.get("amount")) * 100),
          method: form.get("method") === "payment_link" ? "payment_link" : "ussd",
          reference: reference("fund"),
          customer_name: String(form.get("customerName") || "") || undefined,
        },
        crypto.randomUUID(),
      );
      setResult(created);
      setOpen(false);
      await load();
    } catch (cause) {
      setError(messageFrom(cause, "Unable to create the funding request."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Page>
      <PageHeader
        eyebrow="Live wallet"
        title="Wallet"
        subtitle="Money you have put in, and where it has gone since."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh
            </Button>
            <Button
              size="sm"
              onClick={() => setOpen(true)}
              disabled={!canWrite || !wallet?.wallet_ready}
            >
              <Plus size={15} /> Fund wallet
            </Button>
          </>
        }
      />

      {error && <Alert>{error}</Alert>}
      {!wallet?.wallet_ready && !loading && (
        <Alert tone="warn">
          This wallet is still being provisioned. Funding becomes available once its status is
          ready.
        </Alert>
      )}

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
          label="Allocated"
          value={wallet?.allocated.display ?? "—"}
          hint="Held by campaigns"
          loading={loading}
        />
        <StatCard
          label="In flight"
          value={wallet?.in_flight.display ?? "—"}
          hint="Being paid out"
          icon={<TrendingUp size={17} />}
          loading={loading}
        />
        <StatCard
          label="Total held"
          value={wallet?.total.display ?? "—"}
          hint="Across every bucket"
          loading={loading}
        />
      </CardGrid>

      {result && (
        <Alert tone={result.status === "failed" ? "danger" : "ok"}>
          <span className="font-semibold">
            Funding request: {result.status.replaceAll("_", " ")}
          </span>
          {result.ussd_code && (
            <>
              {" "}
              Dial <b>{result.ussd_code}</b> to continue.
            </>
          )}
          {result.payment_url && (
            <>
              {" "}
              <a
                href={result.payment_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-semibold underline"
              >
                Open secure payment <ExternalLink size={12} />
              </a>
            </>
          )}
          {!result.ussd_code && !result.payment_url && (
            <> Payment details are being prepared. This updates on its own.</>
          )}
        </Alert>
      )}

      <Split
        aside={
          <Panel title="Funding requests" description="Money on its way in">
            {loading ? (
              <RowSkeleton rows={3} />
            ) : funding.length ? (
              funding.map((item) => (
                <Row
                  key={item.id}
                  title={<Money size="sm">{item.amount.display}</Money>}
                  meta={shortDate(item.created_at)}
                  right={<StatusBadge status={item.status} />}
                />
              ))
            ) : (
              <EmptyState title="No funding requests" body="Top up to see requests here." />
            )}
          </Panel>
        }
      >
        <Panel title="Wallet statement" description="Every movement, newest first">
          {loading ? (
            <RowSkeleton rows={5} />
          ) : entries.length ? (
            entries.map((entry) => (
              <Row
                key={entry.id}
                title={<span className="font-mono text-[12.5px]">{entry.transaction_id}</span>}
                meta={shortDate(entry.created_at)}
                right={
                  <Money tone={entry.amount < 0 ? "debit" : "credit"}>
                    {formatMinor(entry.amount, entry.currency)}
                  </Money>
                }
              />
            ))
          ) : (
            <EmptyState
              icon={<WalletCards size={20} />}
              title="No wallet activity yet"
              body="Fund the wallet to start the statement."
            />
          )}
        </Panel>
      </Split>

      {open && (
        <Dialog
          title="Fund wallet"
          description="Creates a payment request you can complete on mobile money."
          onClose={() => setOpen(false)}
        >
          <form onSubmit={fund} className="flex flex-col gap-4">
            <Field label={`Amount (${business?.currency})`}>
              <Input required name="amount" min="0.01" step="0.01" type="number" />
            </Field>
            <Field label="Customer name" hint="Optional — shown on the payment request.">
              <Input name="customerName" maxLength={100} />
            </Field>
            <Field label="Payment method">
              <Select name="method">
                <option value="ussd">USSD</option>
                <option value="payment_link">Payment link</option>
              </Select>
            </Field>
            <DialogActions>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Creating…" : "Create request"}
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
