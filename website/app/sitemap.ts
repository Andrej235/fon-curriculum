import { baseUrl } from "@/lib/base-url";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return [
    {
      url: baseUrl,
    },
    {
      url: baseUrl + "/raspored",
    },
  ];
}
