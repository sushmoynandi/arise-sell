import { INITIAL_ORDERS, AlapOrder } from "@/lib/alap-constants";

let memoryOrders: AlapOrder[] = [...INITIAL_ORDERS];

export async function GET() {
  return Response.json({
    status: "success",
    count: memoryOrders.length,
    orders: memoryOrders,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const idempotencyKey = req.headers.get("Idempotency-Key") || body.idempotency_key || `alap_ord_${Date.now()}`;

    // Check duplicate
    const existing = memoryOrders.find((o) => o.idempotency_key === idempotencyKey);
    if (existing) {
      return Response.json(
        {
          status: "duplicate",
          message: "Order already processed with this Idempotency-Key",
          order: existing,
        },
        { status: 200 }
      );
    }

    const newOrder: AlapOrder = {
      id: `ALAP-${1043 + memoryOrders.length}`,
      idempotency_key: idempotencyKey,
      timestamp: "Just now",
      channel: body.channel || "web_widget",
      channel_user_id: body.channel_user_id || body.customer?.phone || "+8801700000000",
      customer: {
        name: body.customer?.name || "Customer",
        phone: body.customer?.phone || "01700000000",
        address: {
          full_address: body.customer?.address?.full_address || "Dhaka, Bangladesh",
          district: body.customer?.address?.district || "Dhaka",
          area: body.customer?.address?.area || "Dhaka",
          delivery_type: body.customer?.address?.delivery_type || "home",
        },
      },
      items: body.order?.items || body.items || [],
      subtotal: body.order?.subtotal || body.subtotal || 2450,
      discount: body.order?.discount || body.discount || 0,
      delivery_charge: body.order?.delivery_charge || body.delivery_charge || 80,
      total_amount: body.order?.total_amount || body.total_amount || 2530,
      payment_method: body.order?.payment_method || body.payment_method || "cod",
      status: "confirmed",
      courier: {
        provider: "Steadfast",
        consignment_id: `SF-${Math.floor(100000 + Math.random() * 900000)}`,
        tracking_code: `SF${Math.floor(1000000 + Math.random() * 9000000)}`,
        status: "Parcel Booked (Pickup Pending)",
      },
      notes: body.order?.notes || body.notes || "",
    };

    memoryOrders = [newOrder, ...memoryOrders];

    return Response.json(
      {
        status: "success",
        message: "Order successfully received and booked with Steadfast Courier",
        order_id: newOrder.id,
        tracking_code: newOrder.courier?.tracking_code,
        order: newOrder,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Invalid payload";
    return Response.json({ status: "error", message: errorMsg }, { status: 400 });
  }
}
