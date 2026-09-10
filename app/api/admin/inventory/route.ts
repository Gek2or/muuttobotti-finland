import { isAdminRequest } from '../admin-auth';
import { handleInventory } from '../../../../lib/inventory/handler.mjs';

// Internal pilot only: existing admin auth + explicit server feature flag.
export async function POST(request: Request) {
  const { env } = await import('cloudflare:workers');
  return handleInventory(request, { authorize: isAdminRequest, env });
}
