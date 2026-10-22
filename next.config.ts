import type { NextConfig } from "next";

// GITHUB_PAGES=1 → xuất bản tĩnh (thư mục out/) để đăng lên GitHub Pages.
// PAGES_BASE_PATH: "/ten-repo" nếu trang nằm ở <user>.github.io/ten-repo, để trống nếu là <user>.github.io.
const staticExport = process.env.GITHUB_PAGES === "1";
const basePath = process.env.PAGES_BASE_PATH || "";

const nextConfig: NextConfig = {
  // Bản tĩnh không hỗ trợ Partial Prerendering nên tắt Cache Components khi export.
  cacheComponents: !staticExport,
  partialPrefetching: !staticExport,
  ...(staticExport && {
    output: "export",
    // Trang và layout đều là .tsx; route.ts của API AI bị bỏ qua vì hosting tĩnh không chạy được máy chủ.
    pageExtensions: ["tsx"],
    basePath,
    trailingSlash: true,
    images: { unoptimized: true },
  }),
  env: {
    NEXT_PUBLIC_STATIC_EXPORT: staticExport ? "1" : "",
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
