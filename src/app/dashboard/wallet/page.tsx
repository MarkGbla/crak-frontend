import type { Metadata } from "next";
import { WalletLiveView } from "@/components/dashboard/wallet-view";

export const metadata: Metadata = { title: "Wallet" };
export default function WalletPage() { return <WalletLiveView />; }
