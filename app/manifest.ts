// app/manifest.ts
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SolveYourMoney",
    short_name: "SYM",
    description: "Turn financial chaos into a clear plan.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    background_color: "#1c1826",
    theme_color: "#3142a9",
    categories: ["finance", "productivity"],
    icons: [
      {
        src: "/icons/192",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/512",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/512",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/180",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
