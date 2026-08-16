# Cloudflare deployment

Production deployments are managed by Cloudflare Workers Builds.

- Source repository: `Gek2or/muuttobotti-finland`
- Production branch: `main`
- Build command: `npm run build:cloudflare`
- Deploy command: `npx wrangler deploy`

Every merge to `main` triggers an automatic production build.
