import { getHomeData } from "@/lib/home-data";
import HomeLayout from "@/components/home/HomeLayout";
import { StoreHeader } from "@/components/layout/StoreHeader";
import { TopCollectionStrip } from "@/components/sections/TopCollectionStrip";

export const revalidate = 300; // ISR: 5 minutes — fast CDN serving, frequent enough for content updates

export default async function Home() {
  const data = await getHomeData();

  return (
    <main>
      <StoreHeader collectionsPromise={data.collectionsPromise} />
      <HomeLayout data={data} />
    </main>
  );
}
