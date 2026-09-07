import Link from "next/link";
import { NewsletterForm } from "./newsletter-form";

/**
 * The closing block: a light full-width band with the wordmark filling its
 * width along the bottom edge.
 *
 * The wordmark is SVG rather than styled text on purpose. `textLength` on the
 * viewBox width makes it span the card exactly at every breakpoint, which a
 * `vw`-based font size only ever approximates.
 */

const COLUMNS = [
  {
    heading: "Product",
    links: [
      { href: "#how", label: "How it works" },
      { href: "#features", label: "Features" },
      { href: "#rails", label: "Payout rails" },
      { href: "#faq", label: "FAQ" },
    ],
  },
  {
    heading: "Get started",
    links: [
      { href: "/sign-up", label: "Create account", accent: true },
      { href: "/sign-in", label: "Sign in" },
      { href: "/dashboard", label: "Dashboard" },
    ],
  },
  {
    heading: "Company",
    links: [
      { href: "#", label: "Privacy policy" },
      { href: "#", label: "Terms & conditions" },
      { href: "#", label: "Contact" },
    ],
  },
];

/**
 * Inline marks rather than lucide icons: lucide dropped its brand set over
 * trademark, so importing Facebook/Instagram/etc. no longer resolves.
 */
const SOCIAL = [
  {
    label: "Facebook",
    href: "https://facebook.com",
    d: "M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h3l1-3h-4v-2c0-.6.4-1 1-1Z",
  },
  {
    label: "Instagram",
    href: "https://instagram.com",
    d: "M12 2c2.7 0 3.1 0 4.1.1 1.1 0 1.8.2 2.4.5.7.2 1.2.6 1.7 1.1s.9 1 1.1 1.7c.3.6.4 1.3.5 2.4.1 1 .1 1.4.1 4.1s0 3.1-.1 4.1c0 1.1-.2 1.8-.5 2.4a4.6 4.6 0 0 1-1.1 1.7c-.5.5-1 .9-1.7 1.1-.6.3-1.3.4-2.4.5-1 .1-1.4.1-4.1.1s-3.1 0-4.1-.1c-1.1 0-1.8-.2-2.4-.5a4.6 4.6 0 0 1-1.7-1.1 4.6 4.6 0 0 1-1.1-1.7c-.3-.6-.4-1.3-.5-2.4C2 15.1 2 14.7 2 12s0-3.1.1-4.1c0-1.1.2-1.8.5-2.4A4.6 4.6 0 0 1 3.7 3.7c.5-.5 1-.9 1.7-1.1.6-.3 1.3-.4 2.4-.5C8.9 2 9.3 2 12 2Zm0 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 2.2a2.8 2.8 0 1 1 0 5.6 2.8 2.8 0 0 1 0-5.6ZM17.5 5.8a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4Z",
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com",
    d: "M6.9 8.5H3.7V21h3.2V8.5ZM5.3 3a1.9 1.9 0 1 0 0 3.8 1.9 1.9 0 0 0 0-3.8ZM20.3 21h-3.2v-6.1c0-1.5-.5-2.5-1.8-2.5-1 0-1.6.7-1.9 1.3l-.1 1V21H10s0-11.3 0-12.5h3.2v1.8c.4-.7 1.2-1.7 3-1.7 2.2 0 3.9 1.4 3.9 4.5V21Z",
  },
  {
    label: "YouTube",
    href: "https://youtube.com",
    d: "M22 12s0-3.2-.4-4.7a2.5 2.5 0 0 0-1.7-1.8C18.3 5 12 5 12 5s-6.3 0-7.9.5c-.8.2-1.5.9-1.7 1.8C2 8.8 2 12 2 12s0 3.2.4 4.7c.2.9.9 1.6 1.7 1.8 1.6.5 7.9.5 7.9.5s6.3 0 7.9-.5a2.5 2.5 0 0 0 1.7-1.8C22 15.2 22 12 22 12ZM10 15V9l5.2 3-5.2 3Z",
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-[var(--footer-surface)] pt-14 sm:pt-20">
      <div className="container-shell">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1.35fr)] lg:gap-16">
          {/* Newsletter, then the social row beneath it. */}
          <div className="max-w-[420px]">
            <h2 className="text-[13.5px] font-bold leading-relaxed tracking-[-0.01em] text-[var(--ink)]">
              Join our newsletter to stay up to date on the latest news and updates.
            </h2>
            <div className="mt-4">
              <NewsletterForm />
            </div>

            <ul className="mt-8 flex list-none gap-2.5 p-0">
              {SOCIAL.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={item.label}
                    className="grid size-9 place-items-center rounded-full border border-[var(--footer-line)]
                      text-[var(--ink-2)] transition-all duration-300 ease-[cubic-bezier(.22,1,.36,1)]
                      hover:-translate-y-0.5 hover:border-[var(--brand-600)] hover:bg-[var(--brand-600)]
                      hover:text-white"
                  >
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden>
                      <path d={item.d} />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Three link columns, mirroring the reference's Sitemap/Partners/Services. */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {COLUMNS.map((column) => (
              <nav key={column.heading} aria-label={column.heading}>
                <h2 className="text-[13px] font-semibold text-[var(--ink)]">{column.heading}</h2>
                <ul className="mt-5 flex list-none flex-col gap-3 p-0">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className={`text-[13.5px] no-underline transition-colors duration-200 ${
                          "accent" in link && link.accent
                            ? "font-medium text-[var(--brand-700)] hover:text-[var(--brand-800)]"
                            : "text-[var(--ink-2)] hover:text-[var(--brand-700)]"
                        }`}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        {/*
          The wordmark runs off the bottom of the page. The clip is an
          aspect ratio rather than a fixed height so it stays at half the
          letterforms on every width: the svg is 1000x250, so it renders at
          width/4 tall and an 8/1 window shows exactly the top half. The mask
          finishes fading before that cut, so the letters dissolve instead of
          ending on a hard edge.
        */}
        <div className="mt-12 aspect-[8/1] overflow-hidden sm:mt-16">
          <div
            className="flex items-start gap-[1.5%]
              [mask-image:linear-gradient(to_bottom,#000_0%,#000_14%,transparent_58%)]
              [-webkit-mask-image:linear-gradient(to_bottom,#000_0%,#000_14%,transparent_58%)]"
          >
            <svg
              viewBox="0 0 1000 250"
              className="block w-full flex-1 text-[var(--brand-600)]"
              role="img"
              aria-label="CRAK"
            >
              <text
                x="0"
                y="248"
                textLength="1000"
                lengthAdjust="spacing"
                fill="currentColor"
                style={{ fontFamily: "var(--font-display), system-ui, sans-serif" }}
                fontSize="340"
                fontWeight="700"
              >
                CRAK
              </text>
            </svg>
            <svg
              viewBox="0 0 24 24"
              className="mt-[3%] w-[clamp(16px,3.2vw,44px)] shrink-0 text-[var(--brand-600)]"
              aria-hidden
            >
              <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.8" />
              <path
                d="M9.4 17.5V6.5h3.4c2 0 3.2 1 3.2 2.8 0 1.3-.7 2.2-1.9 2.6l2.3 5.6h-2.3l-2-5.1h-.6v5.1H9.4Zm2.1-6.7h1.2c.9 0 1.4-.4 1.4-1.3s-.5-1.3-1.4-1.3h-1.2v2.6Z"
                fill="currentColor"
              />
            </svg>
          </div>
        </div>
      </div>
    </footer>
  );
}
