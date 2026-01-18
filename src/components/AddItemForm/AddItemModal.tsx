import { AddItemForm } from './AddItemForm'
import { css } from '../../../styled-system/css'

interface AddItemModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AddItemModal({ isOpen, onClose }: AddItemModalProps) {
  if (!isOpen) return null

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
          Add Inventory Item
        </h2>
        <AddItemForm onSuccess={handleSuccess} onCancel={onClose} />
      </div>
    </div>
  )
}
