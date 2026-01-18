import { useState, useEffect } from 'react'
import { useLocations } from '../../hooks/useLocations'
import { ErrorDisplay } from '../ErrorDisplay/ErrorDisplay'
import { Button } from '../Button/Button'
import { TextInput } from '../TextInput/TextInput'
import { css } from '../../../styled-system/css'
import type { ParsedInventoryItem } from '../../lib/queries/inventory'

interface EditCardModalProps {
  isOpen: boolean
  item: ParsedInventoryItem
  onSave: (updatedItem: ParsedInventoryItem) => void
  onCancel: () => void
}

export function EditCardModal({
  isOpen,
  item,
  onSave,
  onCancel,
}: EditCardModalProps) {
  const { data: locations = [] } = useLocations()

  const [formData, setFormData] = useState<{
    productName: string
    quantity: string
    quantityType: 'units' | 'volume' | 'percentage' | 'weight'
    locationName: string
    addedDate: string
    expirationDate: string
    openedStatus: boolean
  }>({
    productName: item.productName,
    quantity: String(item.quantity),
    quantityType: item.quantityType,
    locationName: item.locationName,
    addedDate: new Date().toISOString().split('T')[0],
    expirationDate: item.expirationDate || '',
    openedStatus: item.openedStatus,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Update form when item changes
  useEffect(() => {
    setFormData({
      productName: item.productName,
      quantity: String(item.quantity),
      quantityType: item.quantityType,
      locationName: item.locationName,
      addedDate: new Date().toISOString().split('T')[0],
      expirationDate: item.expirationDate || '',
      openedStatus: item.openedStatus,
    })
  }, [item])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.productName.trim()) {
      newErrors.productName = 'Product name is required'
    }

    if (!formData.quantity || Number(formData.quantity) <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0'
    }

    if (!formData.locationName) {
      newErrors.locationName = 'Location is required'
    }

    if (
      formData.expirationDate &&
      formData.expirationDate < formData.addedDate
    ) {
      newErrors.expirationDate = 'Expiration date must be after added date'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    if (!validate()) {
      return
    }

    const updatedItem: ParsedInventoryItem = {
      productName: formData.productName.trim(),
      quantity: Number(formData.quantity),
      quantityType: formData.quantityType,
      locationName: formData.locationName,
      expirationDate: formData.expirationDate || undefined,
      openedStatus: formData.openedStatus,
    }

    onSave(updatedItem)
  }

  if (!isOpen) return null

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
      onClick={onCancel}
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
          Edit Item
        </h2>

        <form onSubmit={handleSubmit}>
          {errors.submit && (
            <ErrorDisplay
              message={errors.submit}
              onDismiss={() => setErrors((prev) => ({ ...prev, submit: '' }))}
            />
          )}

          <div
            className={css({
              marginBottom: '1rem',
            })}
          >
            <label
              htmlFor="productName"
              className={css({
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: 'medium',
              })}
            >
              Product Name *
            </label>
            <TextInput
              id="productName"
              type="text"
              value={formData.productName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, productName: e.target.value }))
              }
              required
              error={!!errors.productName}
            />
            {errors.productName && (
              <p
                className={css({
                  marginTop: '0.25rem',
                  fontSize: '0.875rem',
                  color: 'red.600',
                })}
              >
                {errors.productName}
              </p>
            )}
          </div>

          <div
            className={css({
              display: 'grid',
              gridTemplateColumns: '2fr 1fr',
              gap: '1rem',
              marginBottom: '1rem',
            })}
          >
            <div>
              <label
                htmlFor="quantity"
                className={css({
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: 'medium',
                })}
              >
                Quantity *
              </label>
              <TextInput
                id="quantity"
                type="number"
                step="0.01"
                min="0"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, quantity: e.target.value }))
                }
                required
                error={!!errors.quantity}
              />
              {errors.quantity && (
                <p
                  className={css({
                    marginTop: '0.25rem',
                    fontSize: '0.875rem',
                    color: 'red.600',
                  })}
                >
                  {errors.quantity}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="quantityType"
                className={css({
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: 'medium',
                })}
              >
                Type *
              </label>
              <select
                id="quantityType"
                value={formData.quantityType}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    quantityType: e.target.value as typeof formData.quantityType,
                  }))
                }
                required
                className={css({
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid',
                  borderColor: 'gray.300',
                  borderRadius: '0.375rem',
                  fontSize: '1rem',
                  _focus: {
                    outline: 'none',
                    borderColor: 'blue.500',
                    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
                  },
                })}
              >
                <option value="units">Units</option>
                <option value="volume">Volume</option>
                <option value="percentage">Percentage</option>
                <option value="weight">Weight</option>
              </select>
            </div>
          </div>

          <div
            className={css({
              marginBottom: '1rem',
            })}
          >
            <label
              htmlFor="locationName"
              className={css({
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: 'medium',
              })}
            >
              Location *
            </label>
            <select
              id="locationName"
              value={formData.locationName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, locationName: e.target.value }))
              }
              required
              className={css({
                width: '100%',
                padding: '0.75rem',
                border: '1px solid',
                borderColor: errors.locationName ? 'red.300' : 'gray.300',
                borderRadius: '0.375rem',
                fontSize: '1rem',
                _focus: {
                  outline: 'none',
                  borderColor: 'blue.500',
                  boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
                },
              })}
            >
              <option value="">Select a location</option>
              {locations.map((location) => (
                <option key={location.id} value={location.name}>
                  {location.name.charAt(0).toUpperCase() + location.name.slice(1)}
                </option>
              ))}
            </select>
            {errors.locationName && (
              <p
                className={css({
                  marginTop: '0.25rem',
                  fontSize: '0.875rem',
                  color: 'red.600',
                })}
              >
                {errors.locationName}
              </p>
            )}
          </div>

          <div
            className={css({
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              marginBottom: '1rem',
            })}
          >
            <div>
              <label
                htmlFor="addedDate"
                className={css({
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: 'medium',
                })}
              >
                Added Date *
              </label>
              <TextInput
                id="addedDate"
                type="date"
                value={formData.addedDate}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, addedDate: e.target.value }))
                }
                required
              />
            </div>

            <div>
              <label
                htmlFor="expirationDate"
                className={css({
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: 'medium',
                })}
              >
                Expiration Date
              </label>
              <TextInput
                id="expirationDate"
                type="date"
                value={formData.expirationDate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    expirationDate: e.target.value,
                  }))
                }
                min={formData.addedDate}
                error={!!errors.expirationDate}
              />
              {errors.expirationDate && (
                <p
                  className={css({
                    marginTop: '0.25rem',
                    fontSize: '0.875rem',
                    color: 'red.600',
                  })}
                >
                  {errors.expirationDate}
                </p>
              )}
            </div>
          </div>

          <div
            className={css({
              marginBottom: '1.5rem',
            })}
          >
            <label
              className={css({
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
              })}
            >
              <input
                type="checkbox"
                checked={formData.openedStatus}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    openedStatus: e.target.checked,
                  }))
                }
                className={css({
                  width: '1.25rem',
                  height: '1.25rem',
                  cursor: 'pointer',
                })}
              />
              <span
                className={css({
                  fontWeight: 'medium',
                })}
              >
                Item is opened
              </span>
            </label>
          </div>

          <div
            className={css({
              display: 'flex',
              gap: '1rem',
              justifyContent: 'flex-end',
            })}
          >
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
