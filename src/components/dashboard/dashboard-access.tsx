"use client";

import { SignInButton, SignUpButton, useAuth } from "@clerk/nextjs";
import { FormEvent, useState } from "react";
import { Building2, LoaderCircle } from "lucide-react";
import { crakApi } from "@/lib/crak-api";
import { useDashboardData } from "./dashboard-data-provider";

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
      await crakApi.createBusiness(token, { name: String(form.get("name")), currency: String(form.get("currency")) as "SLE" | "USD" });
      await refresh();
    } catch (cause) {
      setFormError(cause instanceof Error ? cause.message : "Unable to create the workspace.");
    } finally {
      setCreating(false);
    }
  }

  if (!isLoaded || isLoading) return <div className="grid min-h-[55vh] place-items-center"><LoaderCircle className="animate-spin text-[#087a4f]" aria-label="Loading workspace" /></div>;

  if (!isSignedIn) return <div className="mx-auto grid min-h-[65vh] max-w-lg place-items-center text-center"><div><span className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#eaf6ee] text-[#087a4f]"><Building2 size={23} /></span><h1 className="mt-5 text-3xl font-semibold tracking-[-.05em]">Sign in to your CRAK workspace</h1><p className="mt-3 text-sm leading-6 text-[#68746d]">Use your secure account to manage real campaigns, wallet funds and rewards.</p><div className="mt-7 flex justify-center gap-3"><SignInButton><button className="btn-primary">Sign in</button></SignInButton><SignUpButton><button className="btn-secondary">Create account</button></SignUpButton></div></div></div>;

  if (error) return <div className="mx-auto mt-12 max-w-xl rounded-2xl border border-[#efd2cb] bg-[#fff5f1] p-5 text-sm text-[#a1422c]"><p className="font-bold">We could not load your workspace.</p><p className="mt-2">{error}</p><button onClick={() => void refresh()} className="mt-4 font-bold underline">Try again</button></div>;

  if (me?.needs_onboarding) return <div className="mx-auto max-w-lg py-12"><span className="grid size-12 place-items-center rounded-2xl bg-[#eaf6ee] text-[#087a4f]"><Building2 size={23} /></span><h1 className="mt-5 text-3xl font-semibold tracking-[-.05em]">Create your business workspace</h1><p className="mt-3 text-sm leading-6 text-[#68746d]">This creates your CRAK wallet and owner access. You can begin setting up campaigns once it is ready.</p><form onSubmit={createBusiness} className="mt-7 rounded-2xl border border-[#dfe5df] bg-white p-6"><label className="block text-xs font-bold">Business name<input name="name" required minLength={2} placeholder="e.g. Freetown Coffee Co." className="mt-2 h-11 w-full rounded-lg border border-[#d9e1da] px-3 text-sm font-normal outline-none focus:border-[#087a4f]" /></label><label className="mt-5 block text-xs font-bold">Base currency<select name="currency" defaultValue="SLE" className="mt-2 h-11 w-full rounded-lg border border-[#d9e1da] bg-white px-3 text-sm font-normal"><option value="SLE">SLE — Sierra Leonean Leone</option><option value="USD">USD — US Dollar</option></select></label>{formError && <p className="mt-4 text-xs font-semibold text-[#b04432]">{formError}</p>}<button disabled={creating} className="btn-primary mt-6 w-full disabled:opacity-60" type="submit">{creating ? "Creating workspace…" : "Create workspace"}</button></form></div>;

  return children;
}
