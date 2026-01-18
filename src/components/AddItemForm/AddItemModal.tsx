import { useState } from 'react'
import { AddItemForm, type AddItemPrefill } from './AddItemForm'
import { BarcodeScanner } from '../BarcodeScanner/BarcodeScanner'
import { lookupProductByBarcode } from '../../lib/queries/products'
import { Button } from '../Button/Button'
import { css } from '../../../styled-system/css'

interface AddItemModalProps {
  isOpen: boolean
  onClose: () => void
}

type ModalMode = 'choice' | 'scan' | 'form'

export function AddItemModal({ isOpen, onClose }: AddItemModalProps) {
  const [mode, setMode] = useState<ModalMode>('choice')
  const [prefill, setPrefill] = useState<AddItemPrefill | undefined>(undefined)
  const [lookupLoading, setLookupLoading] = useState(false)

  if (!isOpen) return null

  const handleSuccess = () => {
    onClose()
  }

  const handleBarcodeScanned = async (barcode: string) => {
    setLookupLoading(true)
    try {
      const product = await lookupProductByBarcode(barcode)
      if (product) {
        setPrefill({ product_id: product.id, productName: product.name })
      } else {
        setPrefill({ productName: '', barcode })
      }
      setMode('form')
    } catch {
      setPrefill({ productName: '', barcode })
      setMode('form')
    } finally {
      setLookupLoading(false)
    }
  }

  const handleCloseScan = () => setMode('choice')
  const handleManualEntryFromScan = () => {
    setPrefill(undefined)
    setMode('form')
  }

  const renderContent = () => {
    if (mode === 'choice') {
      return (
        <>
          <h2
            className={css({
              fontSize: '1.5rem',
              fontWeight: 'bold',
              marginBottom: '1.5rem',
            })}
          >
            Add Inventory Item
          </h2>
          <p
            className={css({
              marginBottom: '1.5rem',
              color: 'gray.600',
            })}
          >
            Scan a barcode to look up the product, or add an item manually.
          </p>
          <div
            className={css({
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            })}
          >
            <Button variant="solid" color="sky" onClick={() => setMode('scan')}>
              Scan barcode
            </Button>
            <Button
              variant="solid"
              color="mauve"
              onClick={() => {
                setPrefill(undefined)
                setMode('form')
              }}
            >
              Add manually
            </Button>
          </div>
        </>
      )
    }

    if (mode === 'scan') {
      return (
        <>
          <h2
            className={css({
              fontSize: '1.5rem',
              fontWeight: 'bold',
              marginBottom: '1rem',
            })}
          >
            Scan barcode
          </h2>
          {lookupLoading && (
            <p
              className={css({
                marginBottom: '1rem',
                color: 'gray.600',
                fontSize: '0.875rem',
              })}
            >
              Looking up product…
            </p>
          )}
          {!lookupLoading && (
            <BarcodeScanner
              onScan={handleBarcodeScanned}
              onClose={handleCloseScan}
              onManualEntry={handleManualEntryFromScan}
            />
          )}
        </>
      )
    }

    // form
    return (
      <>
        <h2
          className={css({
            fontSize: '1.5rem',
            fontWeight: 'bold',
            marginBottom: '1.5rem',
          })}
        >
          Add Inventory Item
        </h2>
        <AddItemForm
          prefill={prefill}
          onSuccess={handleSuccess}
          onCancel={onClose}
        />
      </>
    )
  }

  const isChoice = mode === 'choice'
  const isScan = mode === 'scan'

  return (
    <div
      className={css({
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        padding: '1rem',
      })}
      onClick={isChoice ? onClose : undefined}
    >
      <div
        className={css({
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          padding: '2rem',
          maxWidth: isScan ? 'min(420px, 100%)' : '600px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        })}
        onClick={(e) => e.stopPropagation()}
      >
        {renderContent()}
      </div>
    </div>
  )
}
