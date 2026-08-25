# Cloudflare deployment

Production deployments are managed by Cloudflare Workers Builds.

- Source repository: `Gek2or/muuttobotti-finland`
- Production branch: `main`
- Build command: `npm run build:cloudflare`
- Deploy command: `npx wrangler deploy`

Every merge or push to `main` triggers an automatic production build.

_Last deploy retrigger: 2026-08-25._
