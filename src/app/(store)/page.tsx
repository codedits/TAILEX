import { getHomeData } from "@/lib/home-data";
import HomeLayout from "@/components/home/HomeLayout";
import { StoreHeader } from "@/components/layout/StoreHeader";
import { TopCollectionStrip } from "@/components/sections/TopCollectionStrip";

export const revalidate = 3600; // 1 hour

export default async function Home() {
  const data = await getHomeData();
  const firstCollection = data.collections?.[0] ? {
    title: data.collections[0].title,
    slug: data.collections[0].slug
  } : null;

  return (
    <main>
      <StoreHeader firstCollection={firstCollection} />
      <HomeLayout data={data} />
    </main>
  );
}
