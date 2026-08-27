const IMAGE_TYPES = ["image/gif", "image/png", "image/jpeg", "image/bmp", "image/webp"];
const VIDEO_TYPES = ["video/mp4", "video/webm"];

export function assetKindFromUrl(url: string) {
  if (/\.(mp4|webm|ogg)(\?|$)/i.test(url)) return "video";
  if (/\.gif(\?|$)/i.test(url)) return "gif";
  if (/\.(mp3|wav|m4a|aac)(\?|$)/i.test(url)) return "audio";
  return "image";
}

function readImageDimensions(file: File) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
      URL.revokeObjectURL(url);
    };
    image.onerror = () => {
      reject(new Error("No fue posible leer las dimensiones del archivo."));
      URL.revokeObjectURL(url);
    };
    image.src = url;
  });
}

export async function validatePortalFile(file: File, area: "banner" | "content" | "identity") {
  const allowed = [...IMAGE_TYPES, ...VIDEO_TYPES];
  if (!allowed.includes(file.type)) throw new Error("Formato no compatible. Usa GIF, PNG, JPG, JPEG, BMP, WEBP, MP4 o WEBM.");
  const limitMb = area === "banner" ? 15 : 20;
  if (file.size > limitMb * 1024 * 1024) throw new Error(`El archivo supera el máximo permitido de ${limitMb} MB.`);

  if (area === "banner" && IMAGE_TYPES.includes(file.type)) {
    const { width, height } = await readImageDimensions(file);
    const ratio = width / height;
    if (width < 1200 || height < 300 || Math.abs(ratio - 4) > 0.12) {
      throw new Error("El banner debe medir mínimo 1200 × 300 px y conservar una relación 4:1.");
    }
  }
}
