"use client";

import { useCallback, useEffect } from "react";
import { CircleHelp } from "lucide-react";

export function ProductTour() {
  const startTour = useCallback(async () => {
    const { driver } = await import("driver.js");
    const tour = driver({
      animate: true,
      showProgress: true,
      popoverClass: "crak-tour",
      nextBtnText: "Next",
      prevBtnText: "Back",
      doneBtnText: "Start exploring",
      steps: [
        { element: "[data-tour='workspace']", popover: { title: "Your workspace", description: "Switch between businesses while keeping each wallet and campaign separate.", side: "right", align: "start" } },
        { element: "[data-tour='wallet']", popover: { title: "Reward wallet", description: "See what is ready to pay out, then fund your wallet through the available payment methods.", side: "bottom", align: "center" } },
        { element: "[data-tour='campaigns']", popover: { title: "Campaign pulse", description: "Track active referral campaigns and quickly spot what needs your attention.", side: "bottom", align: "center" } },
        { element: "[data-tour='activity']", popover: { title: "A complete trail", description: "Review referrals and rewards in one place before opening the detailed records.", side: "top", align: "center" } },
      ],
    });
    tour.drive();
  }, []);

  useEffect(() => {
    const seen = window.localStorage.getItem("crak:tour:v1");
    if (seen) return;
    const timer = window.setTimeout(() => {
      window.localStorage.setItem("crak:tour:v1", "true");
      void startTour();
    }, 900);
    return () => window.clearTimeout(timer);
  }, [startTour]);

  return (
    <button onClick={() => void startTour()} className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#d9e1db] bg-white px-3 text-xs font-bold text-[#506057] transition hover:border-[#aebbb1]" type="button">
      <CircleHelp size={16} /> <span className="hidden sm:inline">Take a tour</span>
    </button>
  );
}
