import type { Metadata } from "next";
import { RewardsLiveView } from "@/components/dashboard/live-pages";
export const metadata: Metadata = { title: "Rewards" };
export default function RewardsPage() { return <RewardsLiveView />; }
