import { GalleryPageClient } from "../../../features/gallery-page";

type Props = { params: Promise<{ handle: string }> };

export default async function GalleryPage({ params }: Props) {
  const { handle } = await params;
  return <GalleryPageClient handle={handle} />;
}
