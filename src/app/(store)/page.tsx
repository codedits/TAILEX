import { getHomeData } from "@/lib/home-data";
import HomeLayout from "@/components/home/HomeLayout";
import { StoreHeader } from "@/components/layout/StoreHeader";
import { TopCollectionStrip } from "@/components/sections/TopCollectionStrip";

export const revalidate = 3600; // ISR: 1 hour — static marketing page with periodic updates

export default async function Home() {
  const data = await getHomeData();

  return (
    <main>
      <StoreHeader collectionsPromise={data.collectionsPromise} />
      <HomeLayout data={data} />
    </main>
  );
}
