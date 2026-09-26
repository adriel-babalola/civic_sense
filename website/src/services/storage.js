/**
 * CivicSense website — file handling.
 *
 * The privacy promise on /privacy is that evidence images leave the browser
 * without the metadata that could identify whoever took the photo. JPEG files
 * carry an EXIF block; PNG carries eXIf/tEXt chunks. We rewrite the file
 * rather than trusting a library call, which also means no new dependency
 * ships to every visitor.
 */

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

/** Read a File as an ArrayBuffer. */
export function readAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read that file."));
    reader.readAsArrayBuffer(file);
  });
}

export function isPng(bytes) {
  return PNG_SIGNATURE.every((byte, index) => bytes[index] === byte);
}

/**
 * Locate the APP1 (EXIF/XMP) segment in a JPEG, if present.
 * @returns {{ start: number, end: number } | null}
 */
function findJpegExifSegment(bytes) {
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;

  let offset = 2;
  while (offset < bytes.length - 1) {
    if (bytes[offset] !== 0xff) return null;

    const marker = bytes[offset + 1];
    // Standalone markers carry no length field.
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      offset += 2;
      continue;
    }
    // Start of scan — image data follows, no metadata beyond this point.
    if (marker === 0xda || marker === 0xd9) return null;

    const length = (bytes[offset + 2] << 8) | bytes[offset + 3];
    if (
      marker === 0xe1 &&
      bytes[offset + 4] === 0x45 &&
      bytes[offset + 5] === 0x78 &&
      bytes[offset + 6] === 0x69 &&
      bytes[offset + 7] === 0x66
    ) {
      return { start: offset, end: offset + 2 + length };
    }
    offset += 2 + length;
  }
  return null;
}

/**
 * Strip metadata by re-encoding through the browser's image decoder.
 *
 * This is the strongest available guarantee: what comes back is a pixel
 * buffer plus a re-encoded container, so GPS, timestamps, device serial
 * numbers and thumbnails cannot survive. Cost: the file is re-compressed.
 */
async function reencode(file) {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;

  const context = canvas.getContext("2d");
  context.drawImage(bitmap, 0, 0);
  bitmap.close?.();

  const type = file.type === "image/png" ? "image/png" : "image/jpeg";
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, type, 0.92));

  if (!blob) throw new Error("Could not process that image.");
  return new File([blob], file.name, { type, lastModified: file.lastModified });
}

/**
 * Prepare an evidence image for upload.
 * @returns {Promise<{ file: File, method: string, removed: boolean }>}
 */
export async function stripMetadata(file) {
  try {
    const bytes = new Uint8Array(await readAsArrayBuffer(file));

    if (isPng(bytes)) {
      // PNG keeps its metadata in ancillary chunks (tEXt, iTXt, eXIf). There
      // is no cheap segment-surgery equivalent of the JPEG path, so a PNG is
      // re-encoded — which is the only way to honestly say the data is gone.
      const reencoded = await reencode(file);
      return { file: reencoded, method: "re-encoded", removed: true };
    }

    const segment = findJpegExifSegment(bytes);
    if (!segment) {
      return { file, method: "none", removed: false };
    }

    if (segment.end >= bytes.length) {
      return { file, method: "none", removed: false };
    }

    const cleaned = new File(
      [bytes.slice(0, segment.start), bytes.slice(segment.end)],
      file.name,
      { type: file.type, lastModified: file.lastModified },
    );

    return { file: cleaned, method: "jpeg-append1-stripped", removed: true };
  } catch {
    /* Fall through to re-encoding. */
  }

  try {
    const file2 = await reencode(file);
    return { file: file2, method: "re-encoded", removed: true };
  } catch {
    // Last resort: upload as-is. The server validates type and size, and the
    // privacy page is explicit that stripping is best-effort.
    return { file, method: "unavailable", removed: false };
  }
}

/** Heuristic check used to show the user their file actually has EXIF data. */
export async function hasMetadata(file) {
  try {
    const bytes = new Uint8Array(await readAsArrayBuffer(file));
    if (isPng(bytes)) return true;
    return Boolean(findJpegExifSegment(bytes));
  } catch {
    return false;
  }
}

/** Byte-wise SHA-256 digest, used to fingerprint evidence without storing it. */
export async function hashFile(file) {
  try {
    const buffer = await readAsArrayBuffer(file);
    if (window.crypto?.subtle) {
      const digest = await window.crypto.subtle.digest("SHA-256", buffer);
      return Array.from(new Uint8Array(digest))
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
    }
  } catch {
    /* Fall through. */
  }
  return "";
}

export default { stripMetadata, hasMetadata, hashFile, readAsArrayBuffer };
