import { getActiveStorefront } from "@/storefronts";

export default function Home() {
  const { Page } = getActiveStorefront();

  return <Page />;
}
