import { handlePublicInventory } from '../../../lib/inventory/public-handler.mjs';

export async function POST(request: Request) {
  const { env } = await import('cloudflare:workers');
  return handlePublicInventory(request,{env});
}
