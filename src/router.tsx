import { createRouter } from "@tanstack/react-router";
import { createAppQueryClient } from "@/lib/query-client";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  const queryClient = createAppQueryClient();

  return createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreload: "intent",
  });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
