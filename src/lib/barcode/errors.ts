/**
 * Maps getUserMedia and Html5Qrcode.start failures to user-facing messages.
 * Always suggests "enter the barcode manually" as a fallback.
 */
export function getCameraErrorMessage(error: DOMException | Error): string {
  const name =
    error instanceof DOMException ? error.name : (error as Error).name

  switch (name) {
    case 'NotAllowedError':
      return 'Camera access was denied. Enable it in your browser settings and try again, or enter the barcode manually.'
    case 'NotFoundError':
      return 'No camera was found on this device. You can enter the barcode manually.'
    case 'NotReadableError':
      return 'The camera is in use by another app. Close other apps using the camera and try again, or enter the barcode manually.'
    case 'OverconstrainedError':
      return "This camera doesn't support the requested settings. Try again or enter the barcode manually."
    case 'SecurityError':
      return "Camera requires a secure connection (HTTPS). If you're on HTTP, use HTTPS or enter the barcode manually."
    case 'TypeError':
      return 'Camera is not supported in this browser. Enter the barcode manually.'
    case 'AbortError':
      return 'Camera access was cancelled. Try again or enter the barcode manually.'
    default:
      return 'Could not start the camera. Try again or enter the barcode manually.'
  }
}

/**
 * Returns true if the environment supports getUserMedia (HTTPS or localhost, mediaDevices exists).
 * Use before attempting to start the scanner to show a friendly message instead of failing.
 */
export function isCameraSupported(): boolean {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
    return false
  }
  const { protocol, hostname } =
    typeof location !== 'undefined'
      ? location
      : { protocol: 'https:', hostname: '' }
  if (protocol !== 'https:' && !/^localhost|127\.0\.0\.1$/.test(hostname)) {
    return false
  }
  return true
}
