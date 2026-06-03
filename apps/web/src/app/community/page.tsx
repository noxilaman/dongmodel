import type { Metadata } from "next";
import { CommunityPageClient } from "../../features/community-page";

export const metadata: Metadata = {
  title: "กองกันพลา — Dongmodel",
  description: "ของที่นักสะสมเปิดให้ชม ไม่มีราคา ไม่มี engagement"
};

export default function CommunityPage() {
  return <CommunityPageClient />;
}
