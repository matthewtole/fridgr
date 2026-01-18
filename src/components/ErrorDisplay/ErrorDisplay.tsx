import { css } from '../../../styled-system/css'

interface ErrorDisplayProps {
  message: string
  onDismiss?: () => void
}

export function ErrorDisplay({ message, onDismiss }: ErrorDisplayProps) {
  return (
    <div
      className={css({
        padding: '0.75rem',
        marginBottom: '1rem',
        backgroundColor: 'red.50',
        border: '1px solid',
        borderColor: 'red.200',
        borderRadius: '0.375rem',
        color: 'red.800',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      })}
      role="alert"
    >
      <span>{message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className={css({
            marginLeft: '1rem',
            padding: '0.25rem 0.5rem',
            backgroundColor: 'transparent',
            border: 'none',
            color: 'red.800',
            cursor: 'pointer',
            fontSize: '1.25rem',
            lineHeight: 1,
            _hover: {
              color: 'red.900',
            },
          })}
          aria-label="Dismiss error"
        >
          ×
        </button>
      )}
    </div>
  )
}
