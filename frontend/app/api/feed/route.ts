import { PRODUCTS } from "@/data/catalog";
import { TENANT } from "@/data/tenant";

/**
 * Demo catalog feed — the shape documented at /docs#feed (contract v2).
 * Mock data only; there is no database behind this yet.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get("limit") ?? 250), 250);
  const cursor = Number(searchParams.get("cursor") ?? 0);

  const page = PRODUCTS.slice(cursor, cursor + limit);
  const nextIndex = cursor + limit;

  return Response.json(
    {
      version: "2",
      currency: "BDT",
      store: TENANT.name,
      generated_at: new Date().toISOString(),
      next_cursor: nextIndex < PRODUCTS.length ? String(nextIndex) : null,
      products: page.map((p) => ({
        external_id: p.id,
        title: p.name,
        title_bn: p.nameBn,
        description: p.blurb,
        category: p.category,
        price: p.price,
        compare_at: p.compareAt ?? null,
        stock: p.variants.reduce((a, v) => a + v.stock, 0),
        images: [p.image],
        variations: p.variants.map((v) => ({
          variation_id: v.sku,
          label: v.label,
          color: v.color ?? null,
          size: v.size ?? null,
          price: v.price,
          stock: v.stock,
        })),
        tags: p.tags,
      })),
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
      },
    }
  );
}
