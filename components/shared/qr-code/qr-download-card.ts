/**
 * Generates a branded QR download card for FDM members.
 * Layout: red background · white card · FDM logo overlapping top ·
 *         member name · chapter (optional) · QR code · tagline
 */

const CARD_W = 520;
const BG_COLOR = "#f5ddd8";
const CARD_RADIUS = 12;

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export async function generateBrandedQRCard(
  qrDataUrl: string,
  userName: string,
  logoUrl?: string,
): Promise<string> {
  const [qrImg, logo] = await Promise.all([
    loadImage(qrDataUrl),
    logoUrl ? loadImage(logoUrl) : Promise.resolve(null),
  ]);

  // ── Layout constants ───────────────────────────────────────────────────────
  const C_PAD = 40;
  const CARD_X = C_PAD;
  const CARD_INNER_W = CARD_W - C_PAD * 2;

  const LOGO_BG_SIZE = 76;
  const LOGO_CY = 52; // Center of the circular logo badge
  const LOGO_H = 44; // Logo height inside the badge
  const CARD_Y = LOGO_CY;

  // Stack: name → QR → tagline
  const NAME_Y = LOGO_CY + LOGO_BG_SIZE / 2 + 48;
  const QR_SIZE = 380;
  const QR_X = (CARD_W - QR_SIZE) / 2;
  const QR_Y = NAME_Y + 4;
  const TAGLINE_Y = QR_Y + QR_SIZE + 12;
  const BRANDING_Y = TAGLINE_Y + 28;
  const CARD_INNER_H = BRANDING_Y + 16 + 20 - CARD_Y;
  const CANVAS_H = CARD_Y + CARD_INNER_H + 44;

  // ── Canvas ─────────────────────────────────────────────────────────────────
  const canvas = document.createElement("canvas");
  canvas.width = CARD_W;
  canvas.height = CANVAS_H;
  const ctx = canvas.getContext("2d")!;

  // Background
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, CARD_W, CANVAS_H);

  // White card
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.12)";
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 6;
  ctx.fillStyle = "#ffffff";
  drawRoundRect(ctx, CARD_X, CARD_Y, CARD_INNER_W, CARD_INNER_H, CARD_RADIUS);
  ctx.fill();
  ctx.restore();

  // Logo (White background circular badge)
  if (logo) {
    // Circle background (rounded-full)
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.12)";
    ctx.shadowBlur = 15;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(CARD_W / 2, LOGO_CY, LOGO_BG_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Logo image centered
    const LOGO_W = (logo.naturalWidth / logo.naturalHeight) * LOGO_H;
    const lX = (CARD_W - LOGO_W) / 2;
    const lY = LOGO_CY - LOGO_H / 2;
    ctx.drawImage(logo, lX, lY, LOGO_W, LOGO_H);
  }

  // Member name
  ctx.fillStyle = "#1a1a1a";
  ctx.font = "bold 20px Inter, ui-sans-serif, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(userName.toUpperCase(), CARD_W / 2, NAME_Y);

  // QR code
  if (qrImg) {
    ctx.drawImage(qrImg, QR_X, QR_Y, QR_SIZE, QR_SIZE);
  }

  // Tagline
  ctx.fillStyle = "#888888";
  ctx.font = "15px Inter, ui-sans-serif, sans-serif";
  ctx.fillText("Show your QR to record your attendance", CARD_W / 2, TAGLINE_Y);

  // Branding
  ctx.fillStyle = "#dc2626"; // text-red-600
  ctx.font = "bold 13px Inter, ui-sans-serif, sans-serif";
  ctx.fillText("FRIENDS OF THE DIVINE MERCY", CARD_W / 2, BRANDING_Y);

  return canvas.toDataURL("image/png");
}
