"use client";

import { FormEvent, useState } from "react";

/**
 * The footer subscribe form.
 *
 * It posts to NEXT_PUBLIC_NEWSLETTER_ENDPOINT. With no endpoint configured it
 * says so plainly rather than showing a fake confirmation — a form that claims
 * to have subscribed someone it did not is worse than one that admits it.
 */
const endpoint = process.env.NEXT_PUBLIC_NEWSLETTER_ENDPOINT;

export function NewsletterForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function subscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get("email") ?? "").trim();

    if (!endpoint) {
      setStatus("error");
      setMessage("Newsletter sign-up is not connected yet.");
      return;
    }

    setStatus("sending");
    setMessage(null);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) throw new Error(String(response.status));
      setStatus("done");
      setMessage("Thanks — you are on the list.");
    } catch {
      setStatus("error");
      setMessage("That did not go through. Please try again.");
    }
  }

  return (
    <form onSubmit={subscribe} noValidate={false}>
      <div
        className="newsletter-pill flex items-center gap-2 rounded-full bg-white p-1.5 pl-5
          shadow-[0_1px_2px_rgb(22_35_28/6%)] transition-shadow duration-300
          focus-within:shadow-[0_6px_20px_-8px_rgb(22_35_28/22%)]"
      >
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="Enter your email"
          className="min-w-0 flex-1 bg-transparent py-2 text-[14px] text-[var(--ink)]
            outline-none placeholder:text-[var(--muted-2)]"
        />
        <button
          type="submit"
          disabled={status === "sending"}
          className="h-10 shrink-0 rounded-full bg-[var(--brand-900)] px-5 text-[13.5px]
            font-semibold text-white transition-all duration-300 ease-[cubic-bezier(.22,1,.36,1)]
            hover:bg-[var(--ink)] disabled:opacity-60"
        >
          {status === "sending" ? "Sending…" : "Subscribe"}
        </button>
      </div>

      {message ? (
        <p
          role={status === "error" ? "alert" : "status"}
          className={`mt-3 text-[12px] leading-relaxed ${
            status === "error" ? "text-[var(--danger)]" : "text-[var(--brand-800)]"
          }`}
        >
          {message}
        </p>
      ) : (
        <p className="mt-3 text-[12px] leading-relaxed text-[var(--muted-2)]">
          By subscribing, you agree to our{" "}
          <a href="#" className="text-[var(--muted)] underline underline-offset-2">
            Privacy Policy
          </a>{" "}
          and consent to receive updates from us.
        </p>
      )}
    </form>
  );
}
