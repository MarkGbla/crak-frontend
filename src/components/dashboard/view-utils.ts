/** Small helpers shared by the dashboard views. */

export function messageFrom(cause: unknown, fallback: string) {
  return cause instanceof Error ? cause.message : fallback;
}

export function reference(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
}

export function formatMinor(amount: number, currency: string) {
  return new Intl.NumberFormat("en-SL", {
    style: "currency",
    currency,
    currencyDisplay: "code",
  }).format(amount / 100);
}

export function shortDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
