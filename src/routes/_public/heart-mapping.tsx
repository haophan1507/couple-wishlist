import { createFileRoute } from "@tanstack/react-router";
import { HeartMappingPage } from "@/src/features/heart-mapping/heart-mapping-page";

export const Route = createFileRoute("/_public/heart-mapping")({
  component: HeartMappingPage,
});
