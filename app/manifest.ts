import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SolveYourMoney",
    short_name: "SYM",
    description: "Turn financial chaos into a clear plan.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#f4efe6",
    theme_color: "#3142a9",
    categories: ["finance", "productivity"],
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
