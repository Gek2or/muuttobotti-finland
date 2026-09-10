import vinext from "vinext";
import { defineConfig } from "vite";
import hostingConfig from "./.openai/hosting.json";
import { readFileSync } from "node:fs";
import { sites } from "./build/sites-vite-plugin";

const SITE_CREATOR_PLACEHOLDER_DATABASE_ID =
  "00000000-0000-4000-8000-000000000000";

const { d1, r2 } = hostingConfig;
const isExternalCloudflareDeploy =
  process.env.CLOUDFLARE_EXTERNAL_DEPLOY === "1";
const deploymentConfig = JSON.parse(readFileSync(new URL("./wrangler.jsonc", import.meta.url), "utf8"));
const productionD1 = deploymentConfig.d1_databases?.find((binding: { binding: string }) => binding.binding === "DB");
const externalD1DatabaseId = process.env.CLOUDFLARE_D1_DATABASE_ID || productionD1?.database_id;
const externalR2BucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME;

// macOS Seatbelt blocks FSEvents, so Codex previews need polling for HMR.
const isCodexSeatbeltSandbox = process.env.CODEX_SANDBOX === "seatbelt";

const localBindingConfig = {
  main: "./worker/index.ts",
  compatibility_flags: ["nodejs_compat"],
  d1_databases: d1 && (!isExternalCloudflareDeploy || externalD1DatabaseId)
    ? [
        {
          binding: d1,
          database_name: isExternalCloudflareDeploy
            ? "muuttobotti-db"
            : "site-creator-d1",
          database_id:
            isExternalCloudflareDeploy ? externalD1DatabaseId : SITE_CREATOR_PLACEHOLDER_DATABASE_ID,
        },
      ]
    : [],
  r2_buckets: r2 && (!isExternalCloudflareDeploy || externalR2BucketName)
    ? [
        {
          binding: r2,
          bucket_name: externalR2BucketName ?? "site-creator-r2",
        },
      ]
    : [],
};

export default defineConfig(async () => {
  // Keep Wrangler and Miniflare state project-local. These are non-secret tool
  // settings; application environment belongs in ignored `.env*` files.
  process.env.WRANGLER_WRITE_LOGS ??= "false";
  process.env.WRANGLER_LOG_PATH ??= ".wrangler/logs";
  process.env.MINIFLARE_REGISTRY_PATH ??= ".wrangler/registry";

  // Wrangler snapshots its log path while the Cloudflare plugin is imported.
  const { cloudflare } = await import("@cloudflare/vite-plugin");

  return {
    server: {
      host: "0.0.0.0",
      allowedHosts: ["terminal.local"],
      ...(isCodexSeatbeltSandbox
        ? { watch: { useFsEvents: false, usePolling: true } }
        : {}),
    },
    plugins: [
      vinext(),
      sites(),
      cloudflare({
        viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
        inspectorPort: false,
        config: localBindingConfig,
      }),
    ],
  };
});
