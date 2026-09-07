"use client";

import { SignInButton, SignUpButton, useAuth } from "@clerk/nextjs";
import { FormEvent, useState } from "react";
import { Building2, LoaderCircle } from "lucide-react";
import { crakApi } from "@/lib/crak-api";
import { Button } from "@/components/ui/button";
import { Alert, Field, Input, Panel, Select } from "@/components/ui/dashboard";
import { Cluster } from "@/components/ui/layout";
import { useDashboardData } from "./dashboard-data-provider";

/**
 * The gate in front of every dashboard page.
 *
 * All four states — loading, signed out, failed, onboarding — share one
 * centred layout, so the page does not jump as it resolves through them.
 */
function Gate({
  icon,
  title,
  body,
  children,
}: {
  icon?: React.ReactNode;
  title: string;
  body?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-[62vh] w-full max-w-[var(--measure-narrow)] flex-col items-center justify-center gap-[var(--stack)] text-center">
      <div className="flex flex-col items-center">
        {icon && (
          <span className="grid size-12 place-items-center rounded-[16px] bg-[var(--brand-50)] text-[var(--brand-700)]">
            {icon}
          </span>
        )}
        <h1 className="mt-5 text-[clamp(24px,4vw,32px)] font-semibold tracking-[-0.04em]">
          {title}
        </h1>
        {body && (
          <p className="mt-3 max-w-[52ch] text-[14.5px] leading-relaxed text-[var(--muted)]">
            {body}
          </p>
        )}
      </div>
      {children && <div className="w-full">{children}</div>}
    </div>
  );
}

export function DashboardAccess({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { me, isLoading, error, refresh } = useDashboardData();
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function createBusiness(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setCreating(true);
    setFormError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Your session has expired. Please sign in again.");
      await crakApi.createBusiness(token, {
        name: String(form.get("name")),
        currency: String(form.get("currency")) as "SLE" | "USD",
      });
      await refresh();
    } catch (cause) {
      setFormError(cause instanceof Error ? cause.message : "Unable to create the workspace.");
    } finally {
      setCreating(false);
    }
  }

  if (!isLoaded || isLoading) {
    return (
      <div className="grid min-h-[62vh] place-items-center">
        <LoaderCircle
          className="animate-spin text-[var(--brand-600)]"
          aria-label="Loading workspace"
        />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <Gate
        icon={<Building2 size={23} />}
        title="Sign in to your CRAK workspace"
        body="Use your secure account to manage real campaigns, wallet funds and rewards."
      >
        <Cluster className="justify-center">
          <SignInButton>
            <Button>Sign in</Button>
          </SignInButton>
          <SignUpButton>
            <Button variant="outline">Create account</Button>
          </SignUpButton>
        </Cluster>
      </Gate>
    );
  }

  if (error) {
    return (
      <Gate title="We could not load your workspace">
        <div className="flex flex-col items-center gap-4">
          <Alert>{error}</Alert>
          <Button variant="outline" onClick={() => void refresh()}>
            Try again
          </Button>
        </div>
      </Gate>
    );
  }

  if (me?.needs_onboarding) {
    return (
      <Gate
        icon={<Building2 size={23} />}
        title="Create your business workspace"
        body="This creates your CRAK wallet and owner access. You can set up campaigns once it is ready."
      >
        <Panel className="text-left">
          <form onSubmit={createBusiness} className="flex flex-col gap-4 px-5 py-5">
            <Field label="Business name">
              <Input name="name" required minLength={2} placeholder="e.g. Freetown Coffee Co." />
            </Field>
            <Field label="Base currency">
              <Select name="currency" defaultValue="SLE">
                <option value="SLE">SLE — Sierra Leonean Leone</option>
                <option value="USD">USD — US Dollar</option>
              </Select>
            </Field>
            {formError && <Alert>{formError}</Alert>}
            <Button type="submit" disabled={creating} className="w-full justify-center">
              {creating ? "Creating workspace…" : "Create workspace"}
            </Button>
          </form>
        </Panel>
      </Gate>
    );
  }

  return children;
}
