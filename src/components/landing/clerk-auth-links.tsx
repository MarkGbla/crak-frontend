import type { ReactNode } from "react";
import Link from "next/link";

export function ClerkSignInLink({ className, children }: { className: string; children: ReactNode }) {
  return <Link className={className} href="/sign-in">{children}</Link>;
}

export function ClerkSignUpLink({ className, children }: { className: string; children: ReactNode }) {
  return <Link className={className} href="/sign-up">{children}</Link>;
}
