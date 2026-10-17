/** Longest side of a saved product photo; enough for the 2–4 column grid and the detail sheet. */
const MAX_SIDE = 1000
const QUALITY = 0.82

function encode(source: CanvasImageSource, width: number, height: number) {
  const scale = Math.min(1, MAX_SIDE / Math.max(width, height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(width * scale)
  canvas.height = Math.round(height * scale)
  canvas.getContext('2d')!.drawImage(source, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', QUALITY)
}

/** Downscales and re-encodes a picked or captured file as a JPEG data URL. */
export async function photoFromFile(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('not-an-image')
  const bitmap = await createImageBitmap(file)
  try {
    return encode(bitmap, bitmap.width, bitmap.height)
  } finally {
    bitmap.close()
  }
}

export function photoFromVideo(video: HTMLVideoElement): string {
  return encode(video, video.videoWidth, video.videoHeight)
}

/** Phones and tablets hand `capture` to the native camera app, which beats an in-page preview. */
export const prefersNativeCamera = () => window.matchMedia('(pointer: coarse)').matches

export const canUseWebcam = () => Boolean(navigator.mediaDevices?.getUserMedia)
