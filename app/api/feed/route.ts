import { INITIAL_PRODUCTS } from "@/lib/alap-constants";

export async function GET() {
  return Response.json(
    {
      version: "1.0",
      currency: "BDT",
      updated_at: new Date().toISOString(),
      store: "NextProduct AI Demo Store",
      products: INITIAL_PRODUCTS,
    },
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
      },
    }
  );
}
