import { getHomeData } from "@/lib/home-data";
import HomeLayout from "@/components/home/HomeLayout";
import { StoreHeader } from "@/components/layout/StoreHeader";

export const revalidate = 300; // 5 minutes

export default async function Home() {
  const data = await getHomeData();

  return (
    <main>
      <StoreHeader />
      <HomeLayout data={data} />
    </main>
  );
}
