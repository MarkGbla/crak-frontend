import type { Metadata } from "next";
import { RewardsLiveView } from "@/components/dashboard/rewards-view";
export const metadata: Metadata = { title: "Rewards" };
export default function RewardsPage() { return <RewardsLiveView />; }
