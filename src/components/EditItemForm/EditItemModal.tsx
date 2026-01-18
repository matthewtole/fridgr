import { EditItemForm } from './EditItemForm'
import { css } from '../../../styled-system/css'

interface EditItemModalProps {
  isOpen: boolean
  itemId: number | null
  onClose: () => void
}

export function EditItemModal({ isOpen, itemId, onClose }: EditItemModalProps) {
  if (!isOpen || !itemId) return null

  const handleSuccess = () => {
    onClose()
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
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        })}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          className={css({
            fontSize: '1.5rem',
            fontWeight: 'bold',
            marginBottom: '1.5rem',
          })}
        >
          Edit Inventory Item
        </h2>
        <EditItemForm
          itemId={itemId}
          onSuccess={handleSuccess}
          onCancel={onClose}
        />
      </div>
    </div>
  )
}
