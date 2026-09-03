import { ORDERS } from "@/data/operations";
import { BD_PHONE } from "@/lib/format";
import type { Order } from "@/data/types";

/**
 * Demo order webhook — the shape documented at /docs#orders (contract v2).
 * In-memory only; state resets whenever the server restarts. No backend yet.
 */
let received: Order[] = [...ORDERS];
const seenKeys = new Map<string, string>();

export async function GET() {
  return Response.json({ count: received.length, orders: received });
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  const key = req.headers.get("Idempotency-Key");
  if (!key) {
    return Response.json(
      { error: "missing_idempotency_key", detail: "Send an Idempotency-Key header." },
      { status: 400 }
    );
  }

  // Replay of a key we've already accepted returns the original result, not a new order.
  const existing = seenKeys.get(key);
  if (existing) {
    return Response.json(
      { status: "duplicate", ref: existing, detail: "Already processed." },
      { status: 200 }
    );
  }

  const customer = (body.customer ?? {}) as {
    name?: string;
    phone?: string;
    address?: { line?: string; district?: string };
  };

  if (!customer.phone || !BD_PHONE.test(customer.phone)) {
    return Response.json(
      {
        error: "invalid_phone",
        detail: "Expected a Bangladeshi mobile number matching 01[3-9] plus 8 digits.",
      },
      { status: 422 }
    );
  }

  const lines = Array.isArray(body.lines) ? (body.lines as Order["lines"]) : [];
  if (lines.length === 0) {
    return Response.json(
      { error: "empty_order", detail: "At least one line item is required." },
      { status: 422 }
    );
  }

  const ref = `NP-${20448 + received.length}`;
  const order: Order = {
    id: `ord-${ref.toLowerCase()}`,
    ref,
    customer: customer.name ?? "Customer",
    phone: customer.phone,
    address: customer.address?.line ?? "—",
    district: customer.address?.district ?? "Dhaka",
    channel: (body.channel as Order["channel"]) ?? "web",
    lines,
    delivery: Number(body.delivery_charge ?? 80),
    discount: Number(body.discount ?? 0),
    pay: (body.payment as { method?: Order["pay"] })?.method ?? "cod",
    state: "confirmed",
    placedAt: "Just now",
  };

  received = [order, ...received];
  seenKeys.set(key, ref);

  return Response.json(
    {
      status: "accepted",
      ref,
      state: order.state,
      // Return a payment_url here to make the agent send a bKash/Nagad link instead of COD.
      payment_url: null,
    },
    { status: 201 }
  );
}
