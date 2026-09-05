import { AdminInvoice, ADMIN_MERCHANTS } from "@/data/admin";

function getMerchantDetails(merchantName: string) {
  const match = ADMIN_MERCHANTS.find(
    (m) => m.storeName.toLowerCase() === merchantName.toLowerCase(),
  );
  if (match) return match;
  return {
    storeName: merchantName,
    ownerName: "Store Owner",
    email: `billing@${merchantName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com.bd`,
    phone: "+880 1712-345678",
    city: "Dhaka, Bangladesh",
  };
}

/**
 * Generate a 300 DPI Ultra-High-Definition A4 Canvas and export as a crisp, razor-sharp PDF 1.4
 */
export async function generateInvoicePdfBlob(inv: AdminInvoice): Promise<Blob> {
  const merchant = getMerchantDetails(inv.merchantName);
  const originalPrice = inv.originalAmountBDT || inv.amountBDT;
  const discount = inv.discountBDT || 0;

  // Ultra-HD 300 DPI A4 Resolution: 2480 x 3508 pixels
  const width = 2480;
  const height = 3508;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) throw new Error("Could not get 2D canvas context");

  // High-precision anti-aliasing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // Clean White Background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  const marginX = 160;
  const contentWidth = width - marginX * 2;
  let cursorY = 160;

  // ─── 1. Header: Logo & Company (Left) + Invoice Metadata (Right) ───
  try {
    const img = new Image();
    img.crossOrigin = "anonymous";
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject();
      img.src = "/logo.png";
    });
    const logoHeight = 88;
    const logoWidth = (img.width / img.height) * logoHeight;
    ctx.drawImage(img, marginX, cursorY, logoWidth, logoHeight);
  } catch {
    ctx.font = "bold 52px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillStyle = "#0a6e50";
    ctx.fillText("arisesell.com", marginX, cursorY + 60);
  }

  // Company details (Left)
  ctx.textAlign = "left";
  ctx.font = "bold 38px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillStyle = "#0f1419";
  ctx.fillText("AriseSell Ltd.", marginX, cursorY + 150);

  ctx.font = "28px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillStyle = "#626b76";
  ctx.fillText("House 42, Road 11, Banani, Dhaka-1213", marginX, cursorY + 198);
  ctx.fillText("support@arisesell.com", marginX, cursorY + 242);

  ctx.font = "28px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
  ctx.fillStyle = "#4a5561";
  ctx.fillText("+880 9612-345678", marginX, cursorY + 286);

  // Right Side: INVOICE & Meta
  const rightX = width - marginX;

  // Paid Badge (Top Right)
  const badgeWidth = 145;
  const badgeHeight = 52;
  const badgeX = rightX - badgeWidth;
  const badgeY = cursorY + 16;

  ctx.fillStyle = "rgba(10, 110, 80, 0.1)";
  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 12);
  ctx.fill();

  ctx.font = "bold 26px ui-monospace, monospace";
  ctx.fillStyle = "#0a6e50";
  ctx.textAlign = "center";
  ctx.fillText("✓ PAID", badgeX + badgeWidth / 2, badgeY + 36);

  // INVOICE Title (Right before Badge)
  ctx.textAlign = "right";
  ctx.font = "800 56px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillStyle = "#0f1419";
  ctx.fillText("INVOICE", badgeX - 24, cursorY + 60);

  // Dynamic Key-Value Alignment to prevent ANY text collision
  const drawMetaRow = (
    label: string,
    value: string,
    y: number,
    isBoldValue = false,
    valueColor = "#0f1419",
  ) => {
    // Measure value width
    ctx.font = isBoldValue
      ? "bold 30px ui-monospace, SFMono-Regular, Menlo, Monaco, monospace"
      : "28px ui-monospace, SFMono-Regular, Menlo, Monaco, monospace";
    const valueWidth = ctx.measureText(value).width;

    // Draw value aligned right at rightX
    ctx.textAlign = "right";
    ctx.fillStyle = valueColor;
    ctx.fillText(value, rightX, y);

    // Draw label aligned right right before value with 20px space
    ctx.font = "28px ui-monospace, SFMono-Regular, Menlo, Monaco, monospace";
    ctx.fillStyle = "#626b76";
    ctx.fillText(label, rightX - valueWidth - 20, y);
  };

  drawMetaRow("Invoice No: ", inv.id, cursorY + 140, true, "#0a6e50");
  drawMetaRow("Date: ", inv.date, cursorY + 190);
  drawMetaRow("Method: ", inv.method, cursorY + 240);
  drawMetaRow("TxID: ", inv.txId, cursorY + 290);

  ctx.textAlign = "left";
  cursorY += 350;

  // Divider Line
  ctx.strokeStyle = "#e7e4de";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(marginX, cursorY);
  ctx.lineTo(width - marginX, cursorY);
  ctx.stroke();

  cursorY += 60;

  // ─── 2. Billed To Section ───
  ctx.font = "bold 24px ui-monospace, monospace";
  ctx.fillStyle = "#626b76";
  ctx.fillText("BILLED TO:", marginX, cursorY);

  ctx.font = "bold 38px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillStyle = "#0f1419";
  ctx.fillText(inv.merchantName, marginX, cursorY + 54);

  ctx.font = "29px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillStyle = "#4a5561";
  ctx.fillText(`Attn: ${merchant.ownerName} · ${merchant.city}`, marginX, cursorY + 102);

  ctx.font = "27px ui-monospace, monospace";
  ctx.fillStyle = "#626b76";
  ctx.fillText(`${merchant.phone} · ${merchant.email}`, marginX, cursorY + 146);

  cursorY += 210;

  // ─── 3. Table Header ───
  const tableHeaderY = cursorY;
  const tableHeight = 80;

  ctx.fillStyle = "rgba(10, 110, 80, 0.06)";
  ctx.fillRect(marginX, tableHeaderY, contentWidth, tableHeight);

  ctx.strokeStyle = "rgba(10, 110, 80, 0.25)";
  ctx.lineWidth = 2;
  ctx.strokeRect(marginX, tableHeaderY, contentWidth, tableHeight);

  ctx.font = "bold 24px ui-monospace, monospace";
  ctx.fillStyle = "#0a6e50";

  ctx.fillText("DESCRIPTION", marginX + 32, tableHeaderY + 50);
  ctx.textAlign = "center";
  ctx.fillText("PERIOD", marginX + contentWidth * 0.58, tableHeaderY + 50);
  ctx.textAlign = "right";
  ctx.fillText("UNIT PRICE", marginX + contentWidth * 0.80, tableHeaderY + 50);
  ctx.fillText("AMOUNT (BDT)", width - marginX - 32, tableHeaderY + 50);

  // ─── Table Row ───
  ctx.textAlign = "left";
  cursorY += 80;
  const rowY = cursorY;

  ctx.font = "bold 32px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillStyle = "#0f1419";
  ctx.fillText(`${inv.plan} Subscription Tier`, marginX + 32, rowY + 60);

  ctx.font = "27px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillStyle = "#626b76";
  ctx.fillText("AI commerce auto-reply, orders processing & courier sync", marginX + 32, rowY + 108);

  ctx.textAlign = "center";
  ctx.font = "28px ui-monospace, monospace";
  ctx.fillStyle = "#4a5561";
  ctx.fillText("1 Month", marginX + contentWidth * 0.58, rowY + 76);

  ctx.textAlign = "right";
  ctx.fillStyle = "#0f1419";
  ctx.fillText(`৳${originalPrice.toLocaleString()}`, marginX + contentWidth * 0.80, rowY + 76);

  ctx.font = "bold 30px ui-monospace, monospace";
  ctx.fillText(`৳${originalPrice.toLocaleString()}`, width - marginX - 32, rowY + 76);

  cursorY += 160;

  // Row bottom line
  ctx.strokeStyle = "#e7e4de";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(marginX, cursorY);
  ctx.lineTo(width - marginX, cursorY);
  ctx.stroke();

  cursorY += 50;

  // ─── 4. Financial Summary (Right Aligned) ───
  const summaryBoxWidth = 720;
  const summaryX = width - marginX - summaryBoxWidth;

  ctx.textAlign = "left";
  ctx.font = "28px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillStyle = "#626b76";
  ctx.fillText("Subtotal:", summaryX, cursorY);

  ctx.textAlign = "right";
  ctx.font = "29px ui-monospace, monospace";
  ctx.fillStyle = "#0f1419";
  ctx.fillText(`৳${originalPrice.toLocaleString()}`, width - marginX - 16, cursorY);

  if (inv.promoCode) {
    cursorY += 52;
    ctx.textAlign = "left";
    ctx.font = "27px ui-monospace, monospace";
    ctx.fillStyle = "#8a4700";
    ctx.fillText(`Discount (${inv.promoCode}):`, summaryX, cursorY);

    ctx.textAlign = "right";
    ctx.font = "bold 28px ui-monospace, monospace";
    ctx.fillText(`-৳${discount.toLocaleString()}`, width - marginX - 16, cursorY);
  }

  cursorY += 52;
  ctx.textAlign = "left";
  ctx.font = "28px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillStyle = "#626b76";
  ctx.fillText("VAT / Tax (0%):", summaryX, cursorY);

  ctx.textAlign = "right";
  ctx.font = "28px ui-monospace, monospace";
  ctx.fillStyle = "#0f1419";
  ctx.fillText("৳০", width - marginX - 16, cursorY);

  cursorY += 30;

  // Summary Divider
  ctx.strokeStyle = "#0f1419";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(summaryX, cursorY);
  ctx.lineTo(width - marginX, cursorY);
  ctx.stroke();

  cursorY += 52;
  ctx.textAlign = "left";
  ctx.font = "bold 32px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillStyle = "#0f1419";
  ctx.fillText("Total Paid:", summaryX, cursorY);

  ctx.textAlign = "right";
  ctx.font = "bold 44px ui-monospace, monospace";
  ctx.fillStyle = "#0a6e50";
  ctx.fillText(`৳${inv.amountBDT.toLocaleString()}`, width - marginX - 16, cursorY);

  // ─── 5. Footer ───
  cursorY = height - 280;

  ctx.strokeStyle = "#e7e4de";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(marginX, cursorY);
  ctx.lineTo(width - marginX, cursorY);
  ctx.stroke();

  cursorY += 70;
  ctx.textAlign = "center";
  ctx.font = "bold 28px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillStyle = "#0f1419";
  ctx.fillText(
    "Thank you for partnering with AriseSell to power your commerce.",
    width / 2,
    cursorY,
  );

  cursorY += 48;
  ctx.font = "25px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillStyle = "#626b76";
  ctx.fillText(
    "Official electronic tax invoice & payment receipt. For billing support: support@arisesell.com",
    width / 2,
    cursorY,
  );

  // Convert canvas to valid PDF 1.4 binary Blob at maximum 98% quality
  return canvasToPdfBlob(canvas);
}

/**
 * Convert Canvas image data to a valid standalone PDF 1.4 binary Blob
 */
function canvasToPdfBlob(canvas: HTMLCanvasElement): Blob {
  const imgDataUrl = canvas.toDataURL("image/jpeg", 0.98);
  const base64Data = imgDataUrl.split(",")[1];
  const imgBinary = atob(base64Data);
  const imgLength = imgBinary.length;

  const imgBytes = new Uint8Array(imgLength);
  for (let i = 0; i < imgLength; i++) {
    imgBytes[i] = imgBinary.charCodeAt(i);
  }

  // A4 dimensions in standard PDF points: 595.28 x 841.89
  const pdfWidth = 595.28;
  const pdfHeight = 841.89;

  let pdf = `%PDF-1.4\n`;
  const offsets: number[] = [];

  // Object 1: Catalog
  offsets.push(pdf.length);
  pdf += `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`;

  // Object 2: Pages
  offsets.push(pdf.length);
  pdf += `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`;

  // Object 3: Page
  offsets.push(pdf.length);
  pdf += `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pdfWidth} ${pdfHeight}] /Contents 4 0 R /Resources << /XObject << /Img1 5 0 R >> >> >>\nendobj\n`;

  // Object 4: Contents (draw image to fit A4)
  const contentStream = `q\n${pdfWidth} 0 0 ${pdfHeight} 0 0 cm\n/Img1 Do\nQ\n`;
  offsets.push(pdf.length);
  pdf += `4 0 obj\n<< /Length ${contentStream.length} >>\nstream\n${contentStream}endstream\nendobj\n`;

  // Object 5: Image XObject (JPEG)
  offsets.push(pdf.length);
  const imgHeader = `5 0 obj\n<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imgLength} >>\nstream\n`;

  const headerBytes = new TextEncoder().encode(pdf + imgHeader);
  const endStreamBytes = new TextEncoder().encode(`\nendstream\nendobj\n`);

  const xrefOffset = headerBytes.length + imgBytes.length + endStreamBytes.length;
  const totalObjCount = 6;

  let xref = `xref\n0 ${totalObjCount}\n0000000000 65535 f \n`;
  for (const offset of offsets) {
    xref += `${offset.toString().padStart(10, "0")} 00000 n \n`;
  }

  const trailer = `trailer\n<< /Size ${totalObjCount} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  const trailerBytes = new TextEncoder().encode(xref + trailer);

  return new Blob([headerBytes, imgBytes, endStreamBytes, trailerBytes], {
    type: "application/pdf",
  });
}
