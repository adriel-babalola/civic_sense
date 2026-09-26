import axios from "axios";

const MAX_BYTES = (Number(process.env.MEDIA_MAX_MB) || 5) * 1024 * 1024;
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

const MAGIC = [
  { mime: "image/png", bytes: [0x89, 0x50, 0x4e, 0x47] },
  { mime: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
  { mime: "image/webp", bytes: [0x52, 0x49, 0x46, 0x46] },
  { mime: "image/gif", bytes: [0x47, 0x49, 0x46, 0x38] },
];

function detectMime(buf) {
  for (const m of MAGIC) {
    if (buf.length >= m.bytes.length && m.bytes.every((b, i) => buf[i] === b)) {
      return m.mime;
    }
  }
  return null;
}

export function validateImageBuffer(buffer) {
  if (!buffer || buffer.length === 0) {
    throw new Error("No image data provided");
  }
  if (buffer.length > MAX_BYTES) {
    throw new Error(`Image too large. Max ${MAX_BYTES / (1024 * 1024)}MB.`);
  }
  const mime = detectMime(buffer);
  if (!mime || !ALLOWED_MIME.has(mime)) {
    throw new Error("Unsupported image format. Send JPEG, PNG, WebP or GIF.");
  }
  return mime;
}

export function bufferToDataUrl(buffer, mime) {
  return `data:${mime};base64,${buffer.toString("base64")}`;
}

export function imageFromBuffer(buffer, providedMime) {
  const mime = validateImageBuffer(buffer);
  return { dataUrl: bufferToDataUrl(buffer, mime), mime, bytes: buffer.length };
}

export function imageFromBase64(base64) {
  if (!base64) throw new Error("No image data provided");
  const clean = base64.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(clean, "base64");
  return imageFromBuffer(buffer);
}

export async function imageFromUrl(url) {
  if (!url) throw new Error("No image data provided");
  const response = await axios.get(url, {
    responseType: "arraybuffer",
    timeout: 10000,
    maxContentLength: MAX_BYTES,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
    },
  });
  const buffer = Buffer.from(response.data);
  const contentType = response.headers["content-type"] || "";
  const mime = validateImageBuffer(buffer);
  return { dataUrl: bufferToDataUrl(buffer, mime), mime, bytes: buffer.length, sourceUrl: url, contentType };
}
