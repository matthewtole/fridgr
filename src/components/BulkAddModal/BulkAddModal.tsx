import { useState } from 'react'
import { useParseInventoryText } from '../../hooks/useInventory'
import { useCreateInventoryItemsBatch } from '../../hooks/useInventory'
import { useLocations } from '../../hooks/useLocations'
import { SwipeableCardStack } from '../SwipeableCardStack/SwipeableCardStack'
import { InventoryCard } from '../InventoryCard/InventoryCard'
import { EditCardModal } from '../EditCardModal/EditCardModal'
import { ErrorDisplay } from '../ErrorDisplay/ErrorDisplay'
import { Button } from '../Button/Button'
import { css } from '../../../styled-system/css'
import type { ParsedInventoryItem } from '../../lib/queries/inventory'
import type { Database } from '../../types/database'

type InventoryItemInsert =
  Database['public']['Tables']['inventory_items']['Insert']

interface BulkAddModalProps {
  isOpen: boolean
  onClose: () => void
}

type ModalStep = 'input' | 'review' | 'success'

export function BulkAddModal({ isOpen, onClose }: BulkAddModalProps) {
  const { data: locations = [] } = useLocations()
  const parseMutation = useParseInventoryText()
  const createBatchMutation = useCreateInventoryItemsBatch()

  const [step, setStep] = useState<ModalStep>('input')
  const [textInput, setTextInput] = useState('')
  const [parsedItems, setParsedItems] = useState<ParsedInventoryItem[]>([])
  const [approvedItems, setApprovedItems] = useState<ParsedInventoryItem[]>([])
  const [rejectedItems, setRejectedItems] = useState<ParsedInventoryItem[]>([])
  const [editingItem, setEditingItem] = useState<{
    item: ParsedInventoryItem
    index: number
  } | null>(null)

  if (!isOpen) return null

  const handleParse = async () => {
    if (!textInput.trim()) {
      return
    }

    try {
      const items = await parseMutation.mutateAsync(textInput)
      if (items.length === 0) {
        // Show error that no items were found
        return
      }
      setParsedItems(items)
      setStep('review')
    } catch (error) {
      // Error is handled by mutation
      console.error('Failed to parse text:', error)
    }
  }

  const handleApprove = (item: ParsedInventoryItem) => {
    setApprovedItems((prev) => [...prev, item])
  }

  const handleReject = (item: ParsedInventoryItem) => {
    setRejectedItems((prev) => [...prev, item])
  }

  const handleEdit = (item: ParsedInventoryItem, index: number) => {
    setEditingItem({ item, index })
  }

  const handleSaveEdit = (updatedItem: ParsedInventoryItem) => {
    if (editingItem) {
      const newItems = [...parsedItems]
      newItems[editingItem.index] = updatedItem
      setParsedItems(newItems)
      setEditingItem(null)
    }
  }

  const handleCreateItems = async () => {
    if (approvedItems.length === 0) {
      return
    }

    // Convert ParsedInventoryItem to InventoryItemInsert
    const itemsToCreate: Array<InventoryItemInsert & { productName?: string }> =
      approvedItems.map((item) => {
        // Find location ID from location name
        const location = locations.find(
          (loc) => loc.name.toLowerCase() === item.locationName.toLowerCase()
        )

        if (!location) {
          throw new Error(`Location "${item.locationName}" not found`)
        }

        return {
          quantity: item.quantity,
          quantity_type: item.quantityType,
          location_id: location.id,
          added_date: new Date().toISOString().split('T')[0],
          expiration_date: item.expirationDate || null,
          opened_status: item.openedStatus,
          productName: item.productName,
        }
      })

    try {
      await createBatchMutation.mutateAsync(itemsToCreate)
      setStep('success')
    } catch (error) {
      console.error('Failed to create items:', error)
    }
  }

  const handleReset = () => {
    setTextInput('')
    setParsedItems([])
    setApprovedItems([])
    setRejectedItems([])
    setEditingItem(null)
    setStep('input')
  }

  const handleClose = () => {
    handleReset()
    onClose()
  }

  const allItemsProcessed =
    approvedItems.length + rejectedItems.length >= parsedItems.length

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
      onClick={handleClose}
    >
      <div
        className={css({
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          padding: '2rem',
          maxWidth: '800px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        })}
        onClick={(e) => e.stopPropagation()}
      >
        {step === 'input' && (
          <>
            <h2
              className={css({
                fontSize: '1.5rem',
                fontWeight: 'bold',
                marginBottom: '1.5rem',
              })}
            >
              Bulk Add Items
            </h2>
            <p
              className={css({
                marginBottom: '1rem',
                color: 'gray.600',
              })}
            >
              Enter multiple items as plain text. For example: "2 apples, 1 gallon
              of milk, 3 cans of soup"
            </p>

            {parseMutation.error && (
              <ErrorDisplay
                message={
                  parseMutation.error instanceof Error
                    ? parseMutation.error.message
                    : 'Failed to parse text'
                }
                onDismiss={() => parseMutation.reset()}
              />
            )}

            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="2 apples, 1 gallon of milk, 3 cans of soup..."
              className={css({
                width: '100%',
                minHeight: '200px',
                padding: '1rem',
                border: '1px solid',
                borderColor: 'gray.300',
                borderRadius: '0.375rem',
                fontSize: '1rem',
                fontFamily: 'inherit',
                resize: 'vertical',
                marginBottom: '1.5rem',
                _focus: {
                  outline: 'none',
                  borderColor: 'blue.500',
                  boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
                },
              })}
            />

            <div
              className={css({
                display: 'flex',
                gap: '1rem',
                justifyContent: 'flex-end',
              })}
            >
              <Button variant="secondary" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleParse}
                disabled={!textInput.trim() || parseMutation.isPending}
                loading={parseMutation.isPending}
              >
                {parseMutation.isPending ? 'Parsing...' : 'Parse Items'}
              </Button>
            </div>
          </>
        )}

        {step === 'review' && (
          <>
            <h2
              className={css({
                fontSize: '1.5rem',
                fontWeight: 'bold',
                marginBottom: '1.5rem',
              })}
            >
              Review Items
            </h2>
            <p
              className={css({
                marginBottom: '1.5rem',
                color: 'gray.600',
              })}
            >
              Swipe right to approve, left to reject, or tap to edit
            </p>

            <SwipeableCardStack
              items={parsedItems}
              renderCard={(item, index) => (
                <InventoryCard
                  item={item}
                  onEdit={() => handleEdit(item, index)}
                />
              )}
              onApprove={handleApprove}
              onReject={handleReject}
              onEdit={handleEdit}
            />

            {allItemsProcessed && (
              <div
                className={css({
                  marginTop: '2rem',
                  padding: '1.5rem',
                  backgroundColor: 'gray.50',
                  borderRadius: '0.5rem',
                })}
              >
                <p
                  className={css({
                    marginBottom: '1rem',
                    fontWeight: 'medium',
                  })}
                >
                  Approved: {approvedItems.length} | Rejected:{' '}
                  {rejectedItems.length}
                </p>
                <div
                  className={css({
                    display: 'flex',
                    gap: '1rem',
                    justifyContent: 'flex-end',
                  })}
                >
                  <Button variant="secondary" onClick={handleReset}>
                    Start Over
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleCreateItems}
                    disabled={
                      approvedItems.length === 0 || createBatchMutation.isPending
                    }
                    loading={createBatchMutation.isPending}
                  >
                    {createBatchMutation.isPending
                      ? 'Creating...'
                      : `Create ${approvedItems.length} Item${approvedItems.length !== 1 ? 's' : ''}`}
                  </Button>
                </div>
              </div>
            )}

            {createBatchMutation.error && (
              <ErrorDisplay
                message={
                  createBatchMutation.error instanceof Error
                    ? createBatchMutation.error.message
                    : 'Failed to create items'
                }
                onDismiss={() => createBatchMutation.reset()}
              />
            )}
          </>
        )}

        {step === 'success' && (
          <>
            <div
              className={css({
                textAlign: 'center',
                padding: '2rem',
              })}
            >
              <h2
                className={css({
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  marginBottom: '1rem',
                  color: 'green.600',
                })}
              >
                Success!
              </h2>
              <p
                className={css({
                  marginBottom: '2rem',
                  color: 'gray.600',
                })}
              >
                Created {approvedItems.length} item
                {approvedItems.length !== 1 ? 's' : ''} successfully.
              </p>
              <Button variant="primary" onClick={handleClose}>
                Done
              </Button>
            </div>
          </>
        )}

        {editingItem && (
          <EditCardModal
            isOpen={!!editingItem}
            item={editingItem.item}
            onSave={handleSaveEdit}
            onCancel={() => setEditingItem(null)}
          />
        )}
      </div>
    </div>
  )
}
