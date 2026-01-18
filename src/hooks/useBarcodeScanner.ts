import { useCallback, useRef, useState } from 'react'
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'
import { getCameraErrorMessage } from '../lib/barcode/errors'

/** 1D formats commonly used for food products (UPC, EAN, etc.) */
const BARCODE_FORMATS = [
  Html5QrcodeSupportedFormats.UPC_A,
  Html5QrcodeSupportedFormats.UPC_E,
  Html5QrcodeSupportedFormats.EAN_13,
  Html5QrcodeSupportedFormats.EAN_8,
  Html5QrcodeSupportedFormats.CODE_128,
  Html5QrcodeSupportedFormats.CODE_39,
] as const

export interface UseBarcodeScannerReturn {
  /** Start the scanner; renders into the element with the given id. On success, onSuccess(barcode) is called. */
  start: (
    containerId: string,
    onSuccess: (barcode: string) => void
  ) => Promise<void>
  /** Stop the scanner and release the camera. */
  stop: () => Promise<void>
  /** Clear error and try start again using the last containerId and onSuccess. */
  retry: () => Promise<void>
  isRunning: boolean
  error: string | null
}

export function useBarcodeScanner(): UseBarcodeScannerReturn {
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const scannerRef = useRef<Html5Qrcode | null>(null)
  const lastContainerIdRef = useRef<string | null>(null)
  const lastOnSuccessRef = useRef<((barcode: string) => void) | null>(null)

  const stop = useCallback(async () => {
    const scanner = scannerRef.current
    if (!scanner) {
      return
    }
    try {
      await scanner.stop()
      scanner.clear()
    } finally {
      scannerRef.current = null
      setIsRunning(false)
    }
  }, [])

  const start = useCallback(
    async (containerId: string, onSuccess: (barcode: string) => void) => {
      setError(null)
      lastContainerIdRef.current = containerId
      lastOnSuccessRef.current = onSuccess

      // If a scanner is already running, stop it first
      if (scannerRef.current) {
        await stop()
      }

      const config = {
        formatsToSupport: [...BARCODE_FORMATS],
        verbose: false,
      }
      const scanner = new Html5Qrcode(containerId, config)
      scannerRef.current = scanner

      const cameraConfig = { facingMode: 'environment' as const }
      const scanConfig = {
        fps: 10,
        qrbox: { width: 250, height: 150 },
      }

      try {
        await scanner.start(
          cameraConfig,
          scanConfig,
          (decodedText) => onSuccess(decodedText),
          () => {}
        )
        setIsRunning(true)
      } catch (e) {
        scannerRef.current = null
        setIsRunning(false)
        setError(
          getCameraErrorMessage(e instanceof Error ? e : new Error(String(e)))
        )
      }
    },
    [stop]
  )

  const retry = useCallback(async () => {
    setError(null)
    const id = lastContainerIdRef.current
    const onSuccess = lastOnSuccessRef.current
    if (id && onSuccess) {
      await start(id, onSuccess)
    }
  }, [start])

  return { start, stop, retry, isRunning, error }
}
