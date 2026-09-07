import type { Metadata } from "next";
import { ApiKeysLiveView } from "@/components/dashboard/api-keys-view";
export const metadata: Metadata = { title: "API keys" };
export default function ApiKeysPage() { return <ApiKeysLiveView />; }
