import { useEffect, useRef } from 'react'
import { useBarcodeScanner } from '../../hooks/useBarcodeScanner'
import { Button } from '../Button/Button'
import { css } from '../../../styled-system/css'

const BARCODE_SCANNER_ID = 'barcode-scanner-container'

export interface BarcodeScannerProps {
  onScan: (barcode: string) => void
  onClose: () => void
  onManualEntry?: () => void
  /** When true, show a placeholder and "Simulate scan" instead of the camera. Use in Storybook or when mediaDevices is absent. */
  mock?: boolean
}

export function BarcodeScanner({
  onScan,
  onClose,
  onManualEntry,
  mock = false,
}: BarcodeScannerProps) {
  const { start, stop, retry, isRunning, error } = useBarcodeScanner()
  const onScanRef = useRef(onScan)
  const didScan = useRef(false)

  useEffect(() => {
    onScanRef.current = onScan
  }, [onScan])

  const useMock =
    mock || (typeof navigator !== 'undefined' && !navigator.mediaDevices)

  useEffect(() => {
    if (useMock) return
    didScan.current = false
    const handleSuccess = (barcode: string) => {
      if (didScan.current) return
      didScan.current = true
      onScanRef.current(barcode)
      void stop()
    }
    void start(BARCODE_SCANNER_ID, handleSuccess)
    return () => {
      void stop()
    }
  }, [useMock, start, stop])

  if (useMock) {
    return (
      <div
        className={css({
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          minHeight: 300,
        })}
      >
        <div
          className={css({
            position: 'absolute',
            top: '0.5rem',
            right: '0.5rem',
            zIndex: 10,
          })}
        >
          <Button variant="ghost" color="rose" onClick={onClose} aria-label="Close">
            ×
          </Button>
        </div>
        <div
          className={css({
            flex: 1,
            backgroundColor: 'gray.200',
            borderRadius: '0.375rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'gray.600',
          })}
        >
          Camera simulated
        </div>
        <Button variant="solid" color="sky" onClick={() => onScan('012345678901')}>
          Simulate scan
        </Button>
        {onManualEntry && (
          <Button variant="solid" color="mauve" onClick={onManualEntry}>
            Enter barcode manually
          </Button>
        )}
      </div>
    )
  }

  return (
    <div
      className={css({
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        minHeight: 300,
      })}
    >
      <div
        className={css({
          position: 'absolute',
          top: '0.5rem',
          right: '0.5rem',
          zIndex: 10,
        })}
      >
        <Button variant="ghost" color="rose" onClick={onClose} aria-label="Close">
          ×
        </Button>
      </div>

      <div
        id={BARCODE_SCANNER_ID}
        className={css({
          width: '100%',
          minHeight: 250,
          borderRadius: '0.375rem',
          overflow: 'hidden',
        })}
      />

      {error ? (
        <div
          className={css({
            padding: '0.75rem',
            marginTop: '0.5rem',
            backgroundColor: 'red.50',
            border: '1px solid',
            borderColor: 'red.200',
            borderRadius: '0.375rem',
            color: 'red.800',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          })}
          role="alert"
        >
          <span>{error}</span>
          <div
            className={css({
              display: 'flex',
              gap: '0.5rem',
              flexWrap: 'wrap',
            })}
          >
            <Button
              variant="solid"
              color="mauve"
              size="small"
              onClick={() => void retry()}
            >
              Retry
            </Button>
            {onManualEntry && (
              <Button variant="solid" color="mauve" size="small" onClick={onManualEntry}>
                Enter manually
              </Button>
            )}
          </div>
        </div>
      ) : (
        <>
          <p
            className={css({
              margin: 0,
              fontSize: '0.875rem',
              color: 'gray.600',
            })}
          >
            Point your camera at a barcode
          </p>
          {onManualEntry && (
            <Button variant="solid" color="mauve" onClick={onManualEntry}>
              Enter barcode manually
            </Button>
          )}
        </>
      )}

      {isRunning && (
        <p
          className={css({
            margin: 0,
            fontSize: '0.75rem',
            color: 'gray.500',
          })}
          aria-live="polite"
        >
          Scanning…
        </p>
      )}
    </div>
  )
}
