import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Gift,
  Menu,
  MousePointerClick,
  ShieldCheck,
  WalletCards,
  Zap,
} from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { ProductPreview } from "@/components/landing/product-preview";
import { ScrollReveal } from "@/components/scroll-reveal";
import { ClerkSignInLink, ClerkSignUpLink } from "@/components/landing/clerk-auth-links";

const featureChips = [
  [MousePointerClick, "Referral campaigns"],
  [WalletCards, "Wallet funding"],
  [Gift, "Instant rewards"],
  [BarChart3, "Clear reporting"],
] as const;

const steps = [
  { number: "01", title: "Create a campaign", copy: "Set the reward, campaign rules and who can participate in a few focused steps." },
  { number: "02", title: "Invite your customers", copy: "Give advocates a simple referral experience they can confidently share." },
  { number: "03", title: "Reward real growth", copy: "Approve genuine referrals and send rewards from your funded wallet." },
];

export default function Home() {
  return (
    <main className="overflow-hidden bg-[#fbfcf8]">
      <div className="bg-[#13211a] px-4 py-2.5 text-center text-xs font-medium leading-5 text-white/85">
        <span className="mr-2 inline-block rounded-full bg-[#dafa7b] px-2 py-0.5 font-bold text-[#13211a]">New</span>
        Build referral campaigns your customers actually want to share.
      </div>
      <header className="border-b border-[#e2e7e2] bg-white/90 backdrop-blur-lg">
        <div className="container-shell flex h-[72px] items-center justify-between sm:h-[76px]">
          <BrandLogo />
          <nav className="hidden items-center gap-6 text-sm font-semibold text-[#556159] lg:flex xl:gap-8" aria-label="Primary navigation">
            <a href="#how-it-works" className="transition hover:text-[#087a4f]">How it works</a>
            <a href="#features" className="transition hover:text-[#087a4f]">Features</a>
            <a href="#for-businesses" className="transition hover:text-[#087a4f]">For businesses</a>
          </nav>
          <div className="hidden items-center gap-3 lg:flex">
            <ClerkSignInLink className="btn-secondary !min-h-11">Sign in</ClerkSignInLink>
            <ClerkSignUpLink className="btn-primary !min-h-11">Start for free</ClerkSignUpLink>
          </div>
          <details className="group relative lg:hidden">
            <summary className="grid size-11 cursor-pointer list-none place-items-center rounded-lg border border-[#dbe2dc] [&::-webkit-details-marker]:hidden" aria-label="Open menu"><Menu size={20} /></summary>
            <nav className="absolute right-0 top-12 z-40 flex w-56 flex-col gap-1 rounded-xl border border-[#dde4de] bg-white p-2 shadow-xl" aria-label="Mobile navigation">
              <a href="#how-it-works" className="rounded-lg px-3 py-2.5 text-sm font-semibold hover:bg-[#f4f7f4]">How it works</a>
              <a href="#features" className="rounded-lg px-3 py-2.5 text-sm font-semibold hover:bg-[#f4f7f4]">Features</a>
              <a href="#for-businesses" className="rounded-lg px-3 py-2.5 text-sm font-semibold hover:bg-[#f4f7f4]">For businesses</a>
              <Link href="/dashboard" className="mt-1 rounded-lg bg-[#087a4f] px-3 py-2.5 text-center text-sm font-bold text-white">Open dashboard</Link>
            </nav>
          </details>
        </div>
      </header>

      <section className="relative pb-20 pt-12 sm:pb-24 sm:pt-20 xl:pt-24">
        <div className="absolute -left-40 top-36 size-[440px] rounded-full bg-[#ecf8ef] blur-3xl" />
        <div className="container-shell relative grid items-center gap-12 sm:gap-16 min-[1180px]:grid-cols-[.92fr_1.08fr]">
          <div>
            <h1 className="display-title max-w-[680px] text-[clamp(2.625rem,9vw,4.75rem)] font-semibold leading-[.98]">
              Turn happy customers into your <span className="text-[#087a4f]">growth engine.</span>
            </h1>
            <p className="mt-5 max-w-[570px] text-base leading-7 text-[#657269] sm:mt-7 sm:text-lg sm:leading-8">
              CRAK gives your business one simple place to launch referral campaigns, fund rewards and keep every payout transparent.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row">
              <Link href="/dashboard" className="btn-primary">Explore the dashboard <ArrowRight size={17} /></Link>
              <a href="#how-it-works" className="btn-secondary">See how it works</a>
            </div>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-[#657269] sm:mt-7">
              <span className="inline-flex items-center gap-1.5"><BadgeCheck size={15} className="text-[#087a4f]" /> No setup fee</span>
              <span className="inline-flex items-center gap-1.5"><ShieldCheck size={15} className="text-[#087a4f]" /> Secure wallet controls</span>
            </div>
          </div>
          <ProductPreview />
        </div>
      </section>

      <section className="container-shell marquee-shell py-7" aria-label="CRAK features">
        <div className="marquee-track">
          {[0, 1].map((copy) => (
            <div key={copy} className="marquee-group" aria-hidden={copy === 1}>
              {featureChips.map(([Icon, label]) => (
                <div key={label} className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-[#e0e7e1] bg-[#fbfcf8] px-4 py-2 text-xs font-semibold text-[#4e5d53]">
                  <Icon size={15} className="text-[#087a4f]" /> {label}
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="container-shell py-20 sm:py-28 lg:py-32">
        <ScrollReveal>
          <div className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">From invite to reward</span>
            <h2 className="display-title mt-5 text-[34px] font-semibold leading-tight sm:mt-6 sm:text-5xl">A referral program without the operational headache.</h2>
            <p className="mt-5 text-base leading-7 text-[#69746d]">Designed so your team can move quickly and your customers always know what happens next.</p>
          </div>
        </ScrollReveal>
        <div className="mt-10 grid gap-5 sm:mt-14 md:grid-cols-3">
          {steps.map((step, index) => (
            <ScrollReveal key={step.number} delay={index * 100} className="h-full">
              <article className={`min-h-[240px] h-full rounded-[22px] border border-[#e0e5e0] p-6 sm:p-7 md:min-h-[285px] ${index === 0 ? "bg-[#eaf7ee]" : index === 1 ? "bg-[#fff1e5]" : "bg-[#f1edff]"}`}>
                <span className="font-mono text-xs font-bold text-[#68746c]">{step.number}</span>
                <div className="mt-10 flex items-center justify-between sm:mt-16"><h3 className="max-w-[210px] text-2xl font-semibold tracking-[-0.035em]">{step.title}</h3><ArrowRight size={22} /></div>
                <p className="mt-4 text-sm leading-6 text-[#5f6d64]">{step.copy}</p>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <section id="features" className="container-shell pb-20 sm:pb-28 lg:pb-32">
        <ScrollReveal>
          <div className="grid overflow-hidden rounded-[28px] border border-[#dae3dc] bg-[#eaf5ee] lg:grid-cols-2">
            <div className="flex flex-col justify-center p-7 sm:p-12 lg:p-16">
              <h2 className="display-title text-[34px] font-semibold leading-tight sm:text-5xl">Grow through the trust you have already earned.</h2>
              <p className="mt-5 max-w-lg text-base leading-7 text-[#5f6c64]">Give loyal customers a reason to talk about your business—and give your team a clear record of every campaign, referral and reward.</p>
              <ul className="mt-7 space-y-3 text-sm font-semibold">
                {["Campaign status controls", "SLE and USD reward wallets", "Role-based team access"].map((item) => (
                  <li key={item} className="flex items-center gap-3"><span className="grid size-6 place-items-center rounded-full bg-[#087a4f] text-white"><BadgeCheck size={14} /></span>{item}</li>
                ))}
              </ul>
            </div>
            <div className="relative min-h-[420px] overflow-hidden sm:min-h-[500px] lg:min-h-[620px]">
              <Image src="/images/merchant-hero.jpg" alt="Entrepreneur using her phone outside her store" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
              <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/50 bg-white/88 p-4 shadow-xl backdrop-blur-md sm:bottom-6 sm:left-auto sm:right-6 sm:w-[310px] sm:p-5">
                <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-full bg-[#dafa7b]"><Zap size={18} /></span><div><p className="text-xs text-[#69756d]">Campaign performance</p><p className="mt-0.5 font-bold">32 new referrals this week</p></div></div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      <section id="for-businesses" className="container-shell pb-20 sm:pb-28 lg:pb-32">
        <ScrollReveal>
          <div className="relative overflow-hidden rounded-[24px] bg-[#13211a] px-6 py-12 text-white sm:rounded-[28px] sm:px-12 sm:py-16 lg:px-14 lg:py-20">
            <div className="dot-grid absolute inset-y-0 right-0 w-1/2 opacity-20" />
            <div className="relative max-w-2xl">
              <h2 className="display-title text-[34px] font-semibold leading-tight sm:text-5xl lg:text-6xl">Your next customer could come from your best one.</h2>
              <p className="mt-5 max-w-xl leading-7 text-white/66">Open the product preview and see how CRAK turns referrals and rewards into one calm, connected workflow.</p>
              <Link href="/dashboard" className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-[10px] bg-[#dafa7b] px-5 text-sm font-bold text-[#13211a] transition hover:bg-white">View product preview <ArrowRight size={17} /></Link>
            </div>
          </div>
        </ScrollReveal>
      </section>

      <footer className="border-t border-[#e0e6e1] bg-white py-10">
        <div className="container-shell flex flex-col gap-6 text-sm text-[#6a756e] sm:flex-row sm:items-center sm:justify-between"><BrandLogo /><p>Referral growth, made clear.</p><p>© 2026 CRAK</p></div>
      </footer>
    </main>
  );
}
