import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { ClassicMenuBook } from "@/components/ClassicMenuBook";

export const Route = createFileRoute("/menu/")({
  head: () => ({
    meta: [
      { title: "Menu — Kayan Café & Roastery" },
      {
        name: "description",
        content:
          "The complete classic curated menu of Kayan Café: specialty coffee, signature toasts, fresh bowls, drinks and handcrafted desserts.",
      },
      { property: "og:title", content: "Kayan Café — Classic Menu" },
    ],
  }),
  component: ClassicMenuPage,
});

function ClassicMenuPage() {
  return (
    <div className="min-h-screen bg-[#FCFBF7] text-[#000000]">
      {/* Top Header */}
      <SiteHeader />

      {/* Classic Menu Book Component */}
      <ClassicMenuBook />
    </div>
  );
}
