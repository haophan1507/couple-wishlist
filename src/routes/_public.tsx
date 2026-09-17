import { Outlet, createFileRoute } from "@tanstack/react-router";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";

export const Route = createFileRoute("/_public")({
  component: PublicLayout,
});

function PublicLayout() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
