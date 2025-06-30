import { env } from "@/lib/utils";
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = env("VERCEL_PROJECT_PRODUCTION_URL", "localhost:3000");

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/admin/",
    },
    sitemap: `https://${baseUrl}/sitemap.xml`,
  };
}
