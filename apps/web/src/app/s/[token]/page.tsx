import type { Metadata } from "next";
import { getPublicShare, type SharePayload } from "../../../lib/api";
import { SharePageClient } from "../../../features/share-page";

type Props = { params: Promise<{ token: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  try {
    const payload = await getPublicShare(token);
    const title =
      payload.kind === "MODONG"
        ? payload.modong.name
        : payload.kind === "MODONG_GROUP"
          ? payload.group.name
          : payload.wanted.name;
    return { title: `${title} — Dongmodel` };
  } catch {
    return { title: "Dongmodel" };
  }
}

export default async function SharePage({ params }: Props) {
  const { token } = await params;

  let payload: SharePayload | null = null;
  let notFound = false;

  try {
    payload = await getPublicShare(token);
  } catch {
    notFound = true;
  }

  return <SharePageClient notFound={notFound} payload={payload} />;
}
