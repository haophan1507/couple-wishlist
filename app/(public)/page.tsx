import type { Metadata } from "next";
import { Suspense } from "react";
import { APP_DESCRIPTION } from "@/lib/constants/app";
import { HomeContentFallback, HomePageContent } from "./home-content";

export const metadata: Metadata = {
  title: "Trang chủ",
  description: APP_DESCRIPTION,
};

export default function HomePage() {
  return (
    <Suspense fallback={<HomeContentFallback />}>
      <HomePageContent />
    </Suspense>
  );
}
