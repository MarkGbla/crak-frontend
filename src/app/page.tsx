import {
  CtaBanner,
  Faq,
  Features,
  Hero,
  HowItWorks,
  PartnerStrip,
  PayoutRails,
  SiteFooter,
  SiteHeader,
} from "@/components/landing";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <PartnerStrip />
        <HowItWorks />
        <Features />
        <PayoutRails />
        <Faq />
        <CtaBanner />
      </main>
      <SiteFooter />
    </>
  );
}
