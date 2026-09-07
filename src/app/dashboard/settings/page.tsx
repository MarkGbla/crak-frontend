import type { Metadata } from "next";
import { SettingsLiveView } from "@/components/dashboard/settings-view";
export const metadata: Metadata = { title: "Settings" };
export default function SettingsPage() { return <SettingsLiveView />; }
