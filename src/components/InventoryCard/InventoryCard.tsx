import { css } from '../../../styled-system/css';
import { Button } from '../Button/Button';
import type { ParsedInventoryItem } from '../../lib/queries/inventory';

interface InventoryCardProps {
  item: ParsedInventoryItem;
  onEdit?: () => void;
}

export function InventoryCard({ item, onEdit }: InventoryCardProps) {
  const formatQuantity = () => {
    const quantity = item.quantity;
    const type = item.quantityType;

    if (type === 'units') {
      return `${quantity} ${quantity === 1 ? 'unit' : 'units'}`;
    }
    if (type === 'volume') {
      return `${quantity} ${quantity === 1 ? 'unit' : 'units'} (volume)`;
    }
    if (type === 'weight') {
      return `${quantity} ${quantity === 1 ? 'unit' : 'units'} (weight)`;
    }
    if (type === 'percentage') {
      return `${quantity}%`;
    }
    return `${quantity} ${type}`;
  };

  const formatLocation = () => {
    return (
      item.locationName.charAt(0).toUpperCase() + item.locationName.slice(1)
    );
  };

  return (
    <div
      className={css({
        width: '100%',
        maxWidth: '400px',
        backgroundColor: 'white',
        borderRadius: '1rem',
        boxShadow:
          '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        position: 'relative',
      })}
    >
      <div
        className={css({
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '0.5rem',
        })}
      >
        <h3
          className={css({
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: 'gray.900',
            margin: 0,
          })}
        >
          {item.productName}
        </h3>
        {onEdit && (
          <Button
            variant="solid"
            color="mauve"
            onClick={onEdit}
            className={css({
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
            })}
          >
            Edit
          </Button>
        )}
      </div>

      <div
        className={css({
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        })}
      >
        <div
          className={css({
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          })}
        >
          <span
            className={css({
              fontSize: '0.875rem',
              color: 'gray.600',
              fontWeight: 'medium',
            })}
          >
            Quantity:
          </span>
          <span
            className={css({
              fontSize: '1rem',
              color: 'gray.900',
              fontWeight: 'semibold',
            })}
          >
            {formatQuantity()}
          </span>
        </div>

        <div
          className={css({
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          })}
        >
          <span
            className={css({
              fontSize: '0.875rem',
              color: 'gray.600',
              fontWeight: 'medium',
            })}
          >
            Location:
          </span>
          <span
            className={css({
              fontSize: '1rem',
              color: 'gray.900',
              fontWeight: 'semibold',
            })}
          >
            {formatLocation()}
          </span>
        </div>

        {item.expirationDate && (
          <div
            className={css({
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            })}
          >
            <span
              className={css({
                fontSize: '0.875rem',
                color: 'gray.600',
                fontWeight: 'medium',
              })}
            >
              Expiration:
            </span>
            <span
              className={css({
                fontSize: '1rem',
                color: 'gray.900',
                fontWeight: 'semibold',
              })}
            >
              {new Date(item.expirationDate).toLocaleDateString()}
            </span>
          </div>
        )}

        <div
          className={css({
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          })}
        >
          <span
            className={css({
              fontSize: '0.875rem',
              color: 'gray.600',
              fontWeight: 'medium',
            })}
          >
            Status:
          </span>
          <span
            className={css({
              fontSize: '1rem',
              color: item.openedStatus ? 'orange.600' : 'green.600',
              fontWeight: 'semibold',
            })}
          >
            {item.openedStatus ? 'Opened' : 'Unopened'}
          </span>
        </div>
      </div>
    </div>
  );
}
