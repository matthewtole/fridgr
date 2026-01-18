import { useState } from 'react';
import { useCreateInventoryItem } from '../../hooks/useInventory';
import { useLocations } from '../../hooks/useLocations';
import { ErrorDisplay } from '../ErrorDisplay/ErrorDisplay';
import { Button } from '../Button/Button';
import { TextInput } from '../TextInput/TextInput';
import { css } from '../../../styled-system/css';
import type { Database } from '../../types/database';

type InventoryItemInsert =
  Database['public']['Tables']['inventory_items']['Insert'];

export interface AddItemPrefill {
  product_id?: number;
  productName?: string;
  barcode?: string;
}

interface AddItemFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  prefill?: AddItemPrefill;
}

export function AddItemForm({
  onSuccess,
  onCancel,
  prefill,
}: AddItemFormProps) {
  const { data: locations = [] } = useLocations();
  const createMutation = useCreateInventoryItem();

  const [formData, setFormData] = useState<{
    productName: string;
    quantity: string;
    quantityType: 'units' | 'volume' | 'percentage' | 'weight';
    locationId: string;
    addedDate: string;
    expirationDate: string;
    openedStatus: boolean;
  }>({
    productName: prefill?.productName ?? '',
    quantity: '',
    quantityType: 'units',
    locationId: '',
    addedDate: new Date().toISOString().split('T')[0],
    expirationDate: '',
    openedStatus: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!prefill?.product_id && !formData.productName.trim()) {
      newErrors.productName = 'Product name is required';
    }

    if (!formData.quantity || Number(formData.quantity) <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }

    if (!formData.locationId) {
      newErrors.locationId = 'Location is required';
    }

    if (
      formData.expirationDate &&
      formData.expirationDate < formData.addedDate
    ) {
      newErrors.expirationDate = 'Expiration date must be after added date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validate()) {
      return;
    }

    const insertData: InventoryItemInsert & {
      productName?: string;
      barcode?: string;
    } = {
      quantity: Number(formData.quantity),
      quantity_type: formData.quantityType,
      location_id: Number(formData.locationId),
      added_date: formData.addedDate,
      expiration_date: formData.expirationDate || null,
      opened_status: formData.openedStatus,
    };

    if (prefill?.product_id) {
      insertData.product_id = prefill.product_id;
    } else {
      insertData.productName = formData.productName;
      if (prefill?.barcode?.trim()) {
        insertData.barcode = prefill.barcode.trim();
      }
    }

    try {
      await createMutation.mutateAsync(insertData);
      onSuccess();
    } catch (error) {
      // Error is handled by mutation, but we can show it here too
      setErrors({
        submit:
          error instanceof Error ? error.message : 'Failed to create item',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {errors.submit && (
        <ErrorDisplay
          message={errors.submit}
          onDismiss={() => setErrors((prev) => ({ ...prev, submit: '' }))}
        />
      )}

      {prefill?.barcode && (
        <p
          className={css({
            marginBottom: '1rem',
            fontSize: '0.875rem',
            color: 'gray.600',
          })}
        >
          Scanned: {prefill.barcode}
          {!prefill?.product_id && ' — not found. Enter details below.'}
        </p>
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
          Product Name {prefill?.product_id ? '' : '*'}
        </label>
        <TextInput
          id="productName"
          type="text"
          value={formData.productName}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, productName: e.target.value }))
          }
          required={!prefill?.product_id}
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
        <Button type="button" variant="solid" color="mauve" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="solid"
          color="sky"
          disabled={createMutation.isPending}
          loading={createMutation.isPending}
        >
          {createMutation.isPending ? 'Adding...' : 'Add Item'}
        </Button>
      </div>
    </form>
  );
}
