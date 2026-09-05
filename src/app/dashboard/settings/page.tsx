import type { Metadata } from "next";
import { SettingsLiveView } from "@/components/dashboard/live-pages";
export const metadata: Metadata = { title: "Settings" };
export default function SettingsPage() { return <SettingsLiveView />; }
