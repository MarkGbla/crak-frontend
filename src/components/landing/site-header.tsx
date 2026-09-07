"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { SignInButton, SignUpButton, useAuth, UserButton } from "@clerk/nextjs";
import { ButtonLink } from "@/components/ui/button";

const LINKS = [
  { href: "#top", label: "Home" },
  { href: "#how", label: "How it works" },
  { href: "#features", label: "Features" },
  { href: "#rails", label: "Payouts" },
  { href: "#faq", label: "FAQ" },
];

export function SiteHeader() {
  // Clerk Core 3 dropped <SignedIn>/<SignedOut>; useAuth is what the rest of
  // this app already uses. isLoaded gates the first paint so the header does
  // not flash "Get started" at someone who is already signed in.
  const { isLoaded, isSignedIn } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Once the page scrolls past the hero the header needs its own ground,
  // otherwise white nav text lands on a white section.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ease-[cubic-bezier(.22,1,.36,1)] ${
        scrolled
          ? "border-b border-[var(--brand-600)]/25 bg-[var(--brand-500)]/92 backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <div className="container-shell flex h-[72px] items-center justify-between gap-4">
        <Link href="/" aria-label="CRAK home" className="flex items-center gap-2.5 no-underline">
          <span className="grid size-9 place-items-center rounded-full bg-white/18 ring-1 ring-white/30">
            <span className="block size-3.5 rotate-45 rounded-[3px] border-[3px] border-white" />
          </span>
          <span className="text-[21px] font-bold tracking-[-0.05em] text-white">CRAK</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="relative text-[14px] font-medium text-white/85 no-underline transition-colors duration-200
                hover:text-white after:absolute after:-bottom-1.5 after:left-0 after:h-0.5 after:w-0
                after:rounded-full after:bg-white after:transition-all after:duration-300 hover:after:w-full"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {isLoaded && !isSignedIn && (
            <>
              <SignInButton mode="modal">
                <button className="hidden text-[14px] font-medium text-white/85 transition-colors hover:text-white sm:block">
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button
                  className="group inline-flex h-10 select-none items-center gap-2 rounded-full bg-white pl-5 pr-2
                    text-[14px] font-semibold text-[var(--ink)] shadow-[0_10px_30px_-12px_rgb(0_0_0/35%)]
                    transition-all duration-300 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-0.5"
                >
                  Get started
                  <span className="grid size-6 place-items-center rounded-full bg-[var(--brand-500)] text-white transition-transform duration-300 group-hover:rotate-45">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M7 17 17 7M9 7h8v8" />
                    </svg>
                  </span>
                </button>
              </SignUpButton>
            </>
          )}

          {isLoaded && isSignedIn && (
            <>
              <ButtonLink href="/dashboard" variant="onBrand" size="sm" withArrow>
                Dashboard
              </ButtonLink>
              <UserButton />
            </>
          )}

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="grid size-10 place-items-center rounded-full text-white transition-colors hover:bg-white/15 md:hidden"
          >
            {open ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="anim-fade border-t border-white/15 bg-[var(--brand-600)] md:hidden">
          <nav className="container-shell flex flex-col py-3">
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="border-b border-white/10 py-3.5 text-[15px] font-medium text-white no-underline last:border-0"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
