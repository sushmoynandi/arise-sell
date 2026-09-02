"""Bangla / English Digital Tax Invoice & PDF Generator."""
from __future__ import annotations

from typing import Any


def format_taka(amount: float) -> str:
    """Format Bangladeshi Taka with Bengali comma grouping: ৳১,৪৫০."""
    s = f"{int(amount):,}"
    return f"৳{s}"


def generate_invoice_html(order: dict[str, Any], tenant: dict[str, Any]) -> str:
    """Renders high-definition print-ready invoice HTML."""
    lines_html = "".join([
        f"<tr><td>{item.get('name')}</td><td>{item.get('sku')}</td><td>{item.get('qty')}</td><td>{format_taka(item.get('unit'))}</td><td>{format_taka(item.get('qty') * item.get('unit'))}</td></tr>"
        for item in order.get("lines", [])
    ])

    subtotal = sum(i.get("qty") * i.get("unit") for i in order.get("lines", []))
    delivery = order.get("delivery", 80)
    discount = order.get("discount", 0)
    total = subtotal + delivery - discount

    return f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8"/>
      <title>চালান - {order.get('ref')}</title>
      <style>
        body {{ font-family: sans-serif; padding: 40px; color: #1e293b; }}
        .header {{ display: flex; justify-content: space-between; border-bottom: 2px solid #0a6e50; padding-bottom: 20px; }}
        table {{ width: 100%; border-collapse: collapse; margin-top: 30px; }}
        th, td {{ padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: left; }}
        th {{ background: #f8fafc; font-size: 12px; text-transform: uppercase; }}
        .total-box {{ float: right; width: 280px; margin-top: 20px; }}
        .total-row {{ display: flex; justify-content: space-between; padding: 6px 0; }}
        .grand-total {{ font-size: 18px; font-weight: bold; color: #0a6e50; border-top: 1px solid #cbd5e1; padding-top: 8px; }}
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h2>{tenant.get('name', 'Nokshi & Co.')}</h2>
          <p>{tenant.get('nameBn', 'নকশী অ্যান্ড কোং')} · {tenant.get('kind', 'Handloom & Lifestyle')}</p>
        </div>
        <div style="text-align: right;">
          <h1>চালান</h1>
          <p>ইনভয়েস নং: <b>{order.get('ref')}</b></p>
          <p>তারিখ: {order.get('placedAt', 'Today')}</p>
        </div>
      </div>

      <div style="margin-top: 20px;">
        <h3>ক্রেতার বিবরণ:</h3>
        <p><b>{order.get('customer')}</b> · {order.get('phone')}</p>
        <p>{order.get('address')}, {order.get('district')}</p>
      </div>

      <table>
        <thead>
          <tr><th>পণ্য বিবরণ</th><th>SKU</th><th>পরিমাণ</th><th>একক মূল্য</th><th>মোট</th></tr>
        </thead>
        <tbody>
          {lines_html}
        </tbody>
      </table>

      <div class="total-box">
        <div class="total-row"><span>সাবটোটাল:</span> <span>{format_taka(subtotal)}</span></div>
        <div class="total-row"><span>ডেলিভারি চার্জ:</span> <span>{format_taka(delivery)}</span></div>
        <div class="total-row"><span>ডিসকাউন্ট:</span> <span>-{format_taka(discount)}</span></div>
        <div class="total-row grand-total"><span>সর্বমোট প্রদেয়:</span> <span>{format_taka(total)}</span></div>
      </div>
    </body>
    </html>
    """
