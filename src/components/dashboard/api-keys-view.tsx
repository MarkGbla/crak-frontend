"use client";

import { useAuth } from "@clerk/nextjs";
import { Check, Clipboard, KeyRound, Plus, Trash2 } from "lucide-react";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { crakApi, type ApiKey, type BusinessRole } from "@/lib/crak-api";
import { Button } from "@/components/ui/button";
import {
  Alert,
  Badge,
  EmptyState,
  Field,
  Input,
  Panel,
  Row,
  RowSkeleton,
  Select,
} from "@/components/ui/dashboard";
import { Page, PageHeader, Toolbar } from "@/components/ui/layout";
import { useDashboardData } from "./dashboard-data-provider";
import { messageFrom } from "./view-utils";

export function ApiKeysLiveView() {
  const { business } = useDashboardData();
  const { getToken } = useAuth();
  const [items, setItems] = useState<ApiKey[]>([]);
  const [name, setName] = useState("");
  const [role, setRole] = useState<BusinessRole>("member");
  const [created, setCreated] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isAdmin = business?.role === "owner" || business?.role === "admin";

  const load = useCallback(async () => {
    if (!business || !isAdmin) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Your session could not provide an API token.");
      setItems(await crakApi.apiKeys(token, business.id));
    } catch (cause) {
      setError(messageFrom(cause, "Unable to load API keys."));
    } finally {
      setLoading(false);
    }
  }, [business, getToken, isAdmin]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!business || !name.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Your session could not provide an API token.");
      const key = await crakApi.createApiKey(token, business.id, { name: name.trim(), role });
      setCreated(key.key);
      setCopied(false);
      setName("");
      await load();
    } catch (cause) {
      setError(messageFrom(cause, "Unable to create the API key."));
    } finally {
      setSubmitting(false);
    }
  }

  async function revoke(apiKeyId: string) {
    if (!business) return;
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Your session could not provide an API token.");
      await crakApi.revokeApiKey(token, business.id, apiKeyId);
      await load();
    } catch (cause) {
      setError(messageFrom(cause, "Unable to revoke the API key."));
    }
  }

  async function copyCreatedKey() {
    if (!created) return;
    await navigator.clipboard.writeText(created);
    setCopied(true);
  }

  return (
    <Page width="narrow">
      <PageHeader
        eyebrow="Developers"
        title="API keys"
        subtitle="A key identifies your business when your app reports conversions."
      />

      {!isAdmin ? (
        <Alert tone="warn">Only workspace owners and admins can manage API keys.</Alert>
      ) : (
        <>
          <Panel title="Create a key">
            <form onSubmit={create} className="px-5 py-5">
              <Toolbar>
                <Field label="Key name" className="sm:flex-1">
                  <Input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                    maxLength={120}
                    placeholder="e.g. Production server"
                  />
                </Field>
                <Field label="Role" className="sm:w-[150px]">
                  <Select
                    value={role}
                    onChange={(event) => setRole(event.target.value as BusinessRole)}
                  >
                    <option value="viewer">Viewer</option>
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </Select>
                </Field>
                <Button type="submit" disabled={submitting}>
                  <Plus size={15} /> {submitting ? "Creating…" : "Create key"}
                </Button>
              </Toolbar>
            </form>
          </Panel>

          {error && <Alert>{error}</Alert>}

          {created && (
            <Panel title="Your new key" description="This is the only time it will be shown.">
              <div className="flex flex-col gap-3 px-5 py-5 sm:flex-row sm:items-center">
                <code className="min-w-0 flex-1 overflow-x-auto rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--surface-2)] px-3 py-2.5 font-mono text-[12px]">
                  {created}
                </code>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void copyCreatedKey()}
                >
                  {copied ? <Check size={15} /> : <Clipboard size={15} />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
            </Panel>
          )}

          <Panel title="Active keys">
            {loading ? (
              <RowSkeleton rows={3} />
            ) : items.length ? (
              items.map((item) => (
                <Row
                  key={item.id}
                  avatar={
                    <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-[var(--brand-50)] text-[var(--brand-700)]">
                      <KeyRound size={16} />
                    </span>
                  }
                  title={item.name}
                  meta={<span className="font-mono">{item.key_hint}</span>}
                  right={
                    <>
                      <Badge tone={item.revoked_at ? "neutral" : "brand"}>{item.role}</Badge>
                      <button
                        type="button"
                        onClick={() => void revoke(item.id)}
                        disabled={Boolean(item.revoked_at)}
                        className="grid size-9 shrink-0 place-items-center rounded-[10px] border
                          border-[var(--danger-line)] text-[var(--danger)] transition-colors
                          hover:bg-[var(--danger-soft)] disabled:cursor-not-allowed disabled:opacity-35"
                        aria-label={`Revoke ${item.name}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </>
                  }
                />
              ))
            ) : (
              <EmptyState
                icon={<KeyRound size={20} />}
                title="No API keys yet"
                body="Create one to start reporting conversions from your app."
              />
            )}
          </Panel>
        </>
      )}
    </Page>
  );
}
