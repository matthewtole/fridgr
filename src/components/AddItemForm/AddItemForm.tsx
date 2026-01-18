import { useState } from 'react'
import { useCreateInventoryItem } from '../../hooks/useInventory'
import { useLocations } from '../../hooks/useLocations'
import { ErrorDisplay } from '../ErrorDisplay/ErrorDisplay'
import { css } from '../../../styled-system/css'
import type { Database } from '../../types/database'

type InventoryItemInsert =
  Database['public']['Tables']['inventory_items']['Insert']

interface AddItemFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export function AddItemForm({ onSuccess, onCancel }: AddItemFormProps) {
  const { data: locations = [] } = useLocations()
  const createMutation = useCreateInventoryItem()

  const [formData, setFormData] = useState<{
    productName: string
    quantity: string
    quantityType: 'units' | 'volume' | 'percentage' | 'weight'
    locationId: string
    addedDate: string
    expirationDate: string
    openedStatus: boolean
  }>({
    productName: '',
    quantity: '',
    quantityType: 'units',
    locationId: '',
    addedDate: new Date().toISOString().split('T')[0],
    expirationDate: '',
    openedStatus: false,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.productName.trim()) {
      newErrors.productName = 'Product name is required'
    }

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

    const insertData: InventoryItemInsert & { productName?: string } = {
      quantity: Number(formData.quantity),
      quantity_type: formData.quantityType,
      location_id: Number(formData.locationId),
      added_date: formData.addedDate,
      expiration_date: formData.expirationDate || null,
      opened_status: formData.openedStatus,
      productName: formData.productName, // Will create product entry if provided
    }

    try {
      await createMutation.mutateAsync(insertData)
      onSuccess()
    } catch (error) {
      // Error is handled by mutation, but we can show it here too
      setErrors({
        submit:
          error instanceof Error ? error.message : 'Failed to create item',
      })
    }
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
        <input
          id="productName"
          type="text"
          value={formData.productName}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, productName: e.target.value }))
          }
          required
          className={css({
            width: '100%',
            padding: '0.75rem',
            border: '1px solid',
            borderColor: errors.productName ? 'red.300' : 'gray.300',
            borderRadius: '0.375rem',
            fontSize: '1rem',
            _focus: {
              outline: 'none',
              borderColor: 'blue.500',
              boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
            },
          })}
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
          <input
            id="quantity"
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
          htmlFor="locationId"
          className={css({
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: 'medium',
          })}
        >
          Location *
        </label>
        <select
          id="locationId"
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
            htmlFor="addedDate"
            className={css({
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: 'medium',
            })}
          >
            Added Date *
          </label>
          <input
            id="addedDate"
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
            htmlFor="expirationDate"
            className={css({
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: 'medium',
            })}
          >
            Expiration Date
          </label>
          <input
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
          disabled={createMutation.isPending}
          className={css({
            padding: '0.75rem 1.5rem',
            backgroundColor: 'blue.500',
            color: 'white',
            borderRadius: '0.375rem',
            border: 'none',
            cursor: createMutation.isPending ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            fontWeight: 'medium',
            opacity: createMutation.isPending ? 0.6 : 1,
            _hover: {
              backgroundColor: 'blue.600',
            },
            _disabled: {
              cursor: 'not-allowed',
              opacity: 0.6,
            },
          })}
        >
          {createMutation.isPending ? 'Adding...' : 'Add Item'}
        </button>
      </div>
    </form>
  )
}
