import type { Config } from "@react-router/dev/config";

export default {
  // SPA mode — Firebase Auth doesn't work well with SSR
  ssr: false,
} satisfies Config;
