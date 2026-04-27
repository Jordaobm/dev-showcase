import { MetadataRoute } from "next";

const manifest = (): MetadataRoute.Manifest => {
  return {
    name: "Dev Showcase — Progressive Web App",
    short_name: "Dev Showcase",
    description:
      "Um showcase técnico interativo demonstrando skills avançados em web development: PWA, Auth, 3D, APIs e muito mais.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    theme_color: "#DC2626",
    background_color: "#FFFFFF",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    categories: ["productivity", "utilities"],
  };
};

export default manifest;
