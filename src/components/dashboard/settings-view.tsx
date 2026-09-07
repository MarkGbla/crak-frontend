"use client";

import { useAuth } from "@clerk/nextjs";
import { UserPlus } from "lucide-react";
import { FormEvent, useState } from "react";
import { crakApi, type BusinessRole } from "@/lib/crak-api";
import { Button } from "@/components/ui/button";
import { Alert, Field, Input, Panel, Select } from "@/components/ui/dashboard";
import { Page, PageHeader, Toolbar } from "@/components/ui/layout";
import { useDashboardData } from "./dashboard-data-provider";
import { messageFrom } from "./view-utils";

/** A read-only fact about the workspace. */
function Detail({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="text-[12px] text-[var(--muted)]">{label}</dt>
      <dd className="mt-1 text-[14px] font-semibold">{value ?? "—"}</dd>
    </div>
  );
}

export function SettingsLiveView() {
  const { business, me } = useDashboardData();
  const { getToken } = useAuth();
  const [clerkUserId, setClerkUserId] = useState("");
  const [role, setRole] = useState<BusinessRole>("member");
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isAdmin = business?.role === "owner" || business?.role === "admin";

  async function addMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!business || !clerkUserId.trim()) return;
    setSubmitting(true);
    setError(null);
    setNotice(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Your session could not provide an API token.");
      await crakApi.addMember(token, business.id, { clerk_user_id: clerkUserId.trim(), role });
      setNotice("Member access was added successfully.");
      setClerkUserId("");
    } catch (cause) {
      setError(messageFrom(cause, "Unable to add this member."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Page width="narrow">
      <PageHeader eyebrow="Workspace" title="Settings" />

      <Panel title="Business profile" description="Read-only in the current API.">
        <dl className="grid gap-5 px-5 py-5 sm:grid-cols-2">
          <Detail label="Business" value={business?.name} />
          <Detail label="Workspace slug" value={business?.slug} />
          <Detail label="Currency" value={business?.currency} />
          <Detail label="Your role" value={business?.role} />
          <div className="sm:col-span-2">
            <Detail
              label="Signed-in account"
              value={me?.user.email ?? "No email supplied by Clerk"}
            />
          </div>
        </dl>
      </Panel>

      <Panel
        title="Add a team member"
        description="They must sign in to CRAK once before you can add them."
        actions={
          <span className="grid size-9 place-items-center rounded-[10px] bg-[var(--brand-50)] text-[var(--brand-700)]">
            <UserPlus size={16} />
          </span>
        }
      >
        <div className="flex flex-col gap-4 px-5 py-5">
          {!isAdmin ? (
            <Alert tone="warn">Only workspace owners and admins can add members.</Alert>
          ) : (
            <form onSubmit={addMember}>
              <Toolbar>
                <Field label="Clerk user ID" className="sm:flex-1">
                  <Input
                    value={clerkUserId}
                    onChange={(event) => setClerkUserId(event.target.value)}
                    required
                    minLength={3}
                    maxLength={64}
                    placeholder="user_…"
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
                  {submitting ? "Adding…" : "Add member"}
                </Button>
              </Toolbar>
            </form>
          )}
          {notice && <Alert tone="ok">{notice}</Alert>}
          {error && <Alert>{error}</Alert>}
          <p className="text-[12px] text-[var(--muted-2)]">
            The backend can add members but does not yet expose a member list or removal endpoint.
          </p>
        </div>
      </Panel>
    </Page>
  );
}
