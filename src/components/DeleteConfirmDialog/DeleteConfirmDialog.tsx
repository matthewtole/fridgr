import { useDeleteInventoryItem } from '../../hooks/useInventory'
import { css } from '../../../styled-system/css'

interface DeleteConfirmDialogProps {
  isOpen: boolean
  itemName: string
  itemId: number
  onClose: () => void
}

export function DeleteConfirmDialog({
  isOpen,
  itemName,
  itemId,
  onClose,
}: DeleteConfirmDialogProps) {
  const deleteMutation = useDeleteInventoryItem()

  if (!isOpen) return null

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(itemId)
      onClose()
    } catch (error) {
      // Error is handled by mutation
      console.error('Failed to delete item:', error)
    }
  }

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
      onClick={onClose}
    >
      <div
        className={css({
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          padding: '2rem',
          maxWidth: '400px',
          width: '100%',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        })}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          className={css({
            fontSize: '1.25rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
          })}
        >
          Delete Item
        </h2>
        <p
          className={css({
            marginBottom: '1.5rem',
            color: 'gray.600',
          })}
        >
          Are you sure you want to delete <strong>{itemName}</strong>? This
          action cannot be undone.
        </p>
        <div
          className={css({
            display: 'flex',
            gap: '1rem',
            justifyContent: 'flex-end',
          })}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={deleteMutation.isPending}
            className={css({
              padding: '0.75rem 1.5rem',
              backgroundColor: 'gray.200',
              color: 'gray.800',
              borderRadius: '0.375rem',
              border: 'none',
              cursor: deleteMutation.isPending ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: 'medium',
              _hover: {
                backgroundColor: 'gray.300',
              },
              _disabled: {
                cursor: 'not-allowed',
                opacity: 0.6,
              },
            })}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className={css({
              padding: '0.75rem 1.5rem',
              backgroundColor: 'red.500',
              color: 'white',
              borderRadius: '0.375rem',
              border: 'none',
              cursor: deleteMutation.isPending ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: 'medium',
              opacity: deleteMutation.isPending ? 0.6 : 1,
              _hover: {
                backgroundColor: 'red.600',
              },
              _disabled: {
                cursor: 'not-allowed',
                opacity: 0.6,
              },
            })}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}
