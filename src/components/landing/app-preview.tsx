import {
  ArrowUpRight,
  Bell,
  Gift,
  LayoutDashboard,
  Link2,
  Search,
  Settings,
  Users,
  Wallet,
} from "lucide-react";

/**
 * The product shot in the hero.
 *
 * Drawn in markup rather than dropped in as a PNG: it stays sharp on any
 * display, respells itself in dark mode if that ever lands, animates, and does
 * not go stale the moment the real dashboard changes a colour. The numbers are
 * the ones a real SLE campaign would show.
 */

const NAV = [
  { icon: LayoutDashboard, label: "Overview", active: true },
  { icon: Wallet, label: "Wallet" },
  { icon: Gift, label: "Campaigns" },
  { icon: Users, label: "Referrers" },
  { icon: Link2, label: "Integrations" },
  { icon: Settings, label: "Settings" },
];

const STATS = [
  { label: "Wallet balance", value: "SLE 24,000", note: "Available", tone: "plain" },
  { label: "On campaigns", value: "SLE 19,750", note: "Earmarked", tone: "plain" },
  { label: "Paid this month", value: "SLE 3,420", note: "72 rewards", tone: "brand" },
  { label: "Referrers", value: "248", note: "+18 this week", tone: "plain" },
] as const;

const REWARDS = [
  { who: "Aminata Kamara", what: "First order", amount: "+SLE 200", when: "2m ago" },
  { who: "Ibrahim Sesay", what: "Signup", amount: "+SLE 50", when: "18m ago" },
  { who: "Fatmata Bangura", what: "First order", amount: "+SLE 200", when: "1h ago" },
] as const;

/** Weekly payout volume — drives both the area fill and the line. */
const SERIES = [26, 34, 30, 46, 42, 62, 58];

function Chart() {
  const width = 300;
  const height = 96;
  const max = Math.max(...SERIES);
  const points = SERIES.map((value, index) => {
    const x = (index / (SERIES.length - 1)) * width;
    const y = height - (value / max) * (height - 12) - 6;
    return [x, y] as const;
  });
  const line = points.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${width},${height} L0,${height} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-24 w-full" role="img" aria-label="Payout volume, last seven days">
      <defs>
        <linearGradient id="crakArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--brand-500)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--brand-500)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((t) => (
        <line key={t} x1="0" x2={width} y1={height * t} y2={height * t} stroke="var(--line)" strokeWidth="1" />
      ))}
      <path d={area} fill="url(#crakArea)" />
      <path
        d={line}
        fill="none"
        stroke="var(--brand-600)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Emphasised endpoint, so the eye lands on "now". */}
      <circle cx={points.at(-1)![0]} cy={points.at(-1)![1]} r="4.5" fill="white" stroke="var(--brand-600)" strokeWidth="2.5" />
    </svg>
  );
}

export function AppPreview() {
  return (
    <div className="sheen rounded-[var(--radius-lg)] border border-black/5 bg-white shadow-[var(--shadow-lg)]">
      <div className="flex min-h-[420px]">
        {/* ---------------------------------------------------------- sidebar */}
        <aside className="hidden w-[150px] shrink-0 flex-col border-r border-[var(--line)] bg-[var(--surface-2)] p-3 sm:flex">
          <div className="flex items-center gap-2 px-1.5 py-1">
            <span className="grid size-6 place-items-center rounded-[7px] bg-[var(--brand-700)]">
              <span className="block size-2.5 rotate-45 rounded-[2px] border-2 border-white" />
            </span>
            <span className="text-[15px] font-bold tracking-[-0.05em]">crak</span>
          </div>

          <nav className="mt-4 flex flex-col gap-0.5">
            {NAV.map(({ icon: Icon, label, active }) => (
              <span
                key={label}
                className={`flex items-center gap-2 rounded-lg px-2 py-[7px] text-[11px] font-medium ${
                  active ? "bg-white text-[var(--brand-800)] shadow-[var(--shadow-sm)]" : "text-[var(--muted)]"
                }`}
              >
                <Icon size={13} />
                {label}
              </span>
            ))}
          </nav>

          <div className="mt-auto rounded-[12px] bg-[var(--brand-700)] p-3 text-white">
            <p className="text-[10px] font-semibold opacity-80">Campaign budget</p>
            <p className="mt-1 text-[15px] font-bold">SLE 19,750</p>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/25">
              <span className="block h-full w-[82%] rounded-full bg-white" />
            </div>
          </div>
        </aside>

        {/* ------------------------------------------------------------ main */}
        <div className="min-w-0 flex-1 p-4 sm:p-5">
          <header className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[15px] font-bold tracking-[-0.03em]">Welcome back, Aminata</p>
              <p className="mt-0.5 text-[11px] text-[var(--muted)]">Here is how your referrals are performing</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden size-7 place-items-center rounded-lg border border-[var(--line)] text-[var(--muted)] sm:grid">
                <Search size={13} />
              </span>
              <span className="relative grid size-7 place-items-center rounded-lg border border-[var(--line)] text-[var(--muted)]">
                <Bell size={13} />
                <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-[var(--accent-amber)]" />
              </span>
              <span className="grid size-7 place-items-center rounded-full bg-[var(--brand-100)] text-[10px] font-bold text-[var(--brand-800)]">
                AK
              </span>
            </div>
          </header>

          <div className="mt-4 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className={`rounded-[12px] border p-2.5 ${
                  stat.tone === "brand"
                    ? "border-transparent bg-[var(--brand-50)]"
                    : "border-[var(--line)] bg-white"
                }`}
              >
                <p className="text-[9.5px] font-medium uppercase tracking-[0.07em] text-[var(--muted-2)]">
                  {stat.label}
                </p>
                <p className="mt-1 text-[15px] font-bold tracking-[-0.03em] tabular-nums">{stat.value}</p>
                <p className="mt-0.5 flex items-center gap-1 text-[9.5px] text-[var(--brand-700)]">
                  {stat.tone === "brand" && <ArrowUpRight size={10} />}
                  {stat.note}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-3 grid gap-3 lg:grid-cols-[1.55fr_1fr]">
            <div className="rounded-[12px] border border-[var(--line)] bg-white p-3">
              <div className="flex items-center justify-between">
                <p className="text-[11.5px] font-bold">Payouts this week</p>
                <span className="rounded-full bg-[var(--brand-50)] px-2 py-0.5 text-[9.5px] font-semibold text-[var(--brand-700)]">
                  +18.4%
                </span>
              </div>
              <Chart />
              <div className="flex justify-between text-[9px] text-[var(--muted-2)]">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>
            </div>

            <div className="rounded-[12px] border border-[var(--line)] bg-white p-3">
              <p className="text-[11.5px] font-bold">Campaign rules</p>
              <div className="mt-2.5 flex flex-col gap-2">
                {[
                  { name: "signup", pays: "SLE 50" },
                  { name: "first_order", pays: "5%" },
                ].map((rule) => (
                  <div
                    key={rule.name}
                    className="flex items-center justify-between rounded-lg bg-[var(--surface-2)] px-2.5 py-2"
                  >
                    <code className="text-[10px] font-semibold text-[var(--ink-2)]">{rule.name}</code>
                    <span className="text-[10px] font-bold text-[var(--brand-700)]">{rule.pays}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2.5 rounded-lg border border-dashed border-[var(--brand-200)] px-2.5 py-2 text-[9.5px] leading-snug text-[var(--muted)]">
                Capped at <b className="text-[var(--ink-2)]">3 rewards</b> per referrer each month
              </div>
            </div>
          </div>

          <div className="mt-3 rounded-[12px] border border-[var(--line)] bg-white p-3">
            <div className="flex items-center justify-between">
              <p className="text-[11.5px] font-bold">Recent rewards</p>
              <span className="text-[9.5px] font-semibold text-[var(--brand-700)]">View all</span>
            </div>
            <div className="mt-2 flex flex-col">
              {REWARDS.map((reward, index) => (
                <div
                  key={reward.who}
                  className={`flex items-center gap-2.5 py-1.5 ${
                    index ? "border-t border-[var(--line)]" : ""
                  }`}
                >
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[var(--brand-100)] text-[9px] font-bold text-[var(--brand-800)]">
                    {reward.who.split(" ").map((part) => part[0]).join("")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[10.5px] font-semibold">{reward.who}</p>
                    <p className="text-[9px] text-[var(--muted-2)]">{reward.what}</p>
                  </div>
                  <span className="rounded-full bg-[var(--brand-50)] px-1.5 py-0.5 text-[9.5px] font-bold tabular-nums text-[var(--brand-700)]">
                    {reward.amount}
                  </span>
                  <span className="hidden w-12 text-right text-[9px] text-[var(--muted-2)] sm:block">
                    {reward.when}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
