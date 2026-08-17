const META_OPEN = "[[MUUTTOBOTTI_META_V1]]";
const META_CLOSE = "[[/MUUTTOBOTTI_META_V1]]";

export type BookingNoteParts = {
  estimate: string;
  plan: string;
  customerNotes: string;
};

function clean(value: unknown, max: number) {
  return String(value ?? "").trim().slice(0, max);
}

export function packBookingNotes(estimate: string, plan: string, customerNotes: string) {
  const safeEstimate = clean(estimate, 80);
  const safePlan = clean(plan, 600);
  const safeCustomerNotes = clean(customerNotes, 1600);

  if (!safeEstimate && !safePlan) return safeCustomerNotes;

  const meta = JSON.stringify({ estimate: safeEstimate, plan: safePlan });
  return `${META_OPEN}\n${meta}\n${META_CLOSE}${safeCustomerNotes ? `\n\n${safeCustomerNotes}` : ""}`.slice(0, 2400);
}

function unpackV1(stored: string): BookingNoteParts | null {
  if (!stored.startsWith(META_OPEN)) return null;
  const closeIndex = stored.indexOf(META_CLOSE);
  if (closeIndex < 0) return null;

  const jsonStart = META_OPEN.length;
  const rawMeta = stored.slice(jsonStart, closeIndex).trim();
  const customerNotes = stored.slice(closeIndex + META_CLOSE.length).trim();

  try {
    const parsed = JSON.parse(rawMeta) as { estimate?: unknown; plan?: unknown };
    return {
      estimate: clean(parsed.estimate, 80),
      plan: clean(parsed.plan, 600),
      customerNotes: clean(customerNotes, 1600),
    };
  } catch {
    return null;
  }
}

function unpackLegacy(stored: string): BookingNoteParts | null {
  if (!stored.startsWith("Smart Estimate:") && !stored.startsWith("Calculated plan:")) return null;

  const [metaBlock, ...customerBlocks] = stored.split(/\n\s*\n/);
  let estimate = "";
  let plan = "";

  for (const line of metaBlock.split("\n")) {
    if (line.startsWith("Smart Estimate:")) estimate = clean(line.slice("Smart Estimate:".length), 80);
    if (line.startsWith("Calculated plan:")) plan = clean(line.slice("Calculated plan:".length), 600);
  }

  return {
    estimate,
    plan,
    customerNotes: clean(customerBlocks.join("\n\n"), 1600),
  };
}

export function unpackBookingNotes(value: unknown): BookingNoteParts {
  const stored = clean(value, 2400);
  if (!stored) return { estimate: "", plan: "", customerNotes: "" };

  return unpackV1(stored)
    ?? unpackLegacy(stored)
    ?? { estimate: "", plan: "", customerNotes: clean(stored, 1600) };
}
