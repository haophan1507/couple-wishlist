import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/src/features/home/home-page";

export const Route = createFileRoute("/_public/")({
  component: HomePage,
});
