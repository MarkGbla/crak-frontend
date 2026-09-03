import type { Metadata } from "next";
import { ApiKeysLiveView } from "@/components/dashboard/live-pages";
export const metadata: Metadata = { title: "API keys" };
export default function ApiKeysPage() { return <ApiKeysLiveView />; }
