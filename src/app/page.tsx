import { getHomeData } from "@/lib/home-data";
import HomeLayout from "@/components/home/HomeLayout";
import { StoreHeader } from "@/components/layout/StoreHeader";

export const revalidate = 3600; // 1 hour

export default async function Home() {
  const data = await getHomeData();

  return (
    <main>
      <StoreHeader />
      <HomeLayout data={data} />
    </main>
  );
}
