import type { MetadataRoute } from "next";

const siteNoIndex =
  process.env.NEXT_PUBLIC_SITE_NOINDEX === "1" || process.env.SITE_NOINDEX === "1";

export default function robots(): MetadataRoute.Robots {
  if (siteNoIndex) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
  };
}
