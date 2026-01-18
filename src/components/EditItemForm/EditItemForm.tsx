import { useState, useEffect } from 'react'
import {
  useInventoryItem,
  useUpdateInventoryItem,
} from '../../hooks/useInventory'
import { useLocations } from '../../hooks/useLocations'
import { ErrorDisplay } from '../ErrorDisplay/ErrorDisplay'
import { css } from '../../../styled-system/css'
import type { Database } from '../../types/database'

type InventoryItemUpdate =
  Database['public']['Tables']['inventory_items']['Update']

interface EditItemFormProps {
  itemId: number
  onSuccess: () => void
  onCancel: () => void
}

export function EditItemForm({
  itemId,
  onSuccess,
  onCancel,
}: EditItemFormProps) {
  const { data: item, isLoading: isLoadingItem } = useInventoryItem(itemId)
  const { data: locations = [] } = useLocations()
  const updateMutation = useUpdateInventoryItem()

  // Derive initial form data from item
  const getInitialFormData = () => {
    if (!item) {
      return {
        quantity: '',
        quantityType: 'units' as const,
        locationId: '',
        addedDate: '',
        expirationDate: '',
        openedStatus: false,
      }
    }
    return {
      quantity: String(item.quantity),
      quantityType: item.quantity_type as
        | 'units'
        | 'volume'
        | 'percentage'
        | 'weight',
      locationId: String(item.location_id),
      addedDate: item.added_date,
      expirationDate: item.expiration_date || '',
      openedStatus: item.opened_status || false,
    }
  }

  const [formData, setFormData] = useState(getInitialFormData)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Update form data when item changes
  useEffect(() => {
    if (item) {
      setFormData(getInitialFormData())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.quantity || Number(formData.quantity) <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0'
    }

    if (!formData.locationId) {
      newErrors.locationId = 'Location is required'
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    if (!validate()) {
      return
    }

    const updateData: InventoryItemUpdate = {
      quantity: Number(formData.quantity),
      quantity_type: formData.quantityType,
      location_id: Number(formData.locationId),
      added_date: formData.addedDate,
      expiration_date: formData.expirationDate || null,
      opened_status: formData.openedStatus,
    }

    try {
      await updateMutation.mutateAsync({ id: itemId, data: updateData })
      onSuccess()
    } catch (error) {
      setErrors({
        submit:
          error instanceof Error ? error.message : 'Failed to update item',
      })
    }
  }

  if (isLoadingItem) {
    return (
      <div
        className={css({
          padding: '2rem',
          textAlign: 'center',
          color: 'gray.600',
        })}
      >
        Loading item...
      </div>
    )
  }

  if (!item) {
    return (
      <div
        className={css({
          padding: '2rem',
          textAlign: 'center',
          color: 'red.600',
        })}
      >
        Item not found
      </div>
    )
  }

  return (
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
          padding: '0.75rem',
          backgroundColor: 'gray.50',
          borderRadius: '0.375rem',
        })}
      >
        <p
          className={css({
            fontSize: '0.875rem',
            color: 'gray.600',
            marginBottom: '0.25rem',
          })}
        >
          Product Name
        </p>
        <p
          className={css({
            fontWeight: 'medium',
          })}
        >
          {item.products?.name || 'Manual Entry'}
        </p>
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
            htmlFor="edit-quantity"
            className={css({
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: 'medium',
            })}
          >
            Quantity *
          </label>
          <input
            id="edit-quantity"
            type="number"
            step="0.01"
            min="0"
            value={formData.quantity}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, quantity: e.target.value }))
            }
            required
            className={css({
              width: '100%',
              padding: '0.75rem',
              border: '1px solid',
              borderColor: errors.quantity ? 'red.300' : 'gray.300',
              borderRadius: '0.375rem',
              fontSize: '1rem',
              _focus: {
                outline: 'none',
                borderColor: 'blue.500',
                boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
              },
            })}
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
            htmlFor="edit-quantityType"
            className={css({
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: 'medium',
            })}
          >
            Type *
          </label>
          <select
            id="edit-quantityType"
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
          htmlFor="edit-locationId"
          className={css({
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: 'medium',
          })}
        >
          Location *
        </label>
        <select
          id="edit-locationId"
          value={formData.locationId}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, locationId: e.target.value }))
          }
          required
          className={css({
            width: '100%',
            padding: '0.75rem',
            border: '1px solid',
            borderColor: errors.locationId ? 'red.300' : 'gray.300',
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
            <option key={location.id} value={location.id}>
              {location.name.charAt(0).toUpperCase() + location.name.slice(1)}
            </option>
          ))}
        </select>
        {errors.locationId && (
          <p
            className={css({
              marginTop: '0.25rem',
              fontSize: '0.875rem',
              color: 'red.600',
            })}
          >
            {errors.locationId}
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
            htmlFor="edit-addedDate"
            className={css({
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: 'medium',
            })}
          >
            Added Date *
          </label>
          <input
            id="edit-addedDate"
            type="date"
            value={formData.addedDate}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, addedDate: e.target.value }))
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
          />
        </div>

        <div>
          <label
            htmlFor="edit-expirationDate"
            className={css({
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: 'medium',
            })}
          >
            Expiration Date
          </label>
          <input
            id="edit-expirationDate"
            type="date"
            value={formData.expirationDate}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                expirationDate: e.target.value,
              }))
            }
            min={formData.addedDate}
            className={css({
              width: '100%',
              padding: '0.75rem',
              border: '1px solid',
              borderColor: errors.expirationDate ? 'red.300' : 'gray.300',
              borderRadius: '0.375rem',
              fontSize: '1rem',
              _focus: {
                outline: 'none',
                borderColor: 'blue.500',
                boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
              },
            })}
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
        <button
          type="button"
          onClick={onCancel}
          className={css({
            padding: '0.75rem 1.5rem',
            backgroundColor: 'gray.200',
            color: 'gray.800',
            borderRadius: '0.375rem',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 'medium',
            _hover: {
              backgroundColor: 'gray.300',
            },
          })}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={updateMutation.isPending}
          className={css({
            padding: '0.75rem 1.5rem',
            backgroundColor: 'blue.500',
            color: 'white',
            borderRadius: '0.375rem',
            border: 'none',
            cursor: updateMutation.isPending ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            fontWeight: 'medium',
            opacity: updateMutation.isPending ? 0.6 : 1,
            _hover: {
              backgroundColor: 'blue.600',
            },
            _disabled: {
              cursor: 'not-allowed',
              opacity: 0.6,
            },
          })}
        >
          {updateMutation.isPending ? 'Updating...' : 'Update Item'}
        </button>
      </div>
    </form>
  )
}
