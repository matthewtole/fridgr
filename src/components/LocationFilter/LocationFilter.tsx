import { useLocations } from '../../hooks/useLocations';
import { css } from '../../../styled-system/css';

interface LocationFilterProps {
  value: number | undefined;
  onChange: (locationId: number | undefined) => void;
}

export function LocationFilter({ value, onChange }: LocationFilterProps) {
  const { data: locations = [], isLoading } = useLocations();

  if (isLoading) {
    return (
      <div
        className={css({
          padding: '0.5rem',
          color: 'gray.600',
          fontSize: '0.875rem',
        })}
      >
        Loading locations...
      </div>
    );
  }

  return (
    <select
      value={value || ''}
      onChange={(e) => {
        const locationId = e.target.value ? Number(e.target.value) : undefined;
        onChange(locationId);
      }}
      className={css({
        padding: '0.5rem 0.75rem',
        border: '1px solid',
        borderColor: 'gray.300',
        borderRadius: '0.375rem',
        fontSize: '0.875rem',
        backgroundColor: 'white',
        cursor: 'pointer',
        _focus: {
          outline: 'none',
          borderColor: 'blue.500',
          boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
        },
      })}
    >
      <option value="">All Locations</option>
      {locations.map((location) => (
        <option key={location.id} value={location.id}>
          {location.name.charAt(0).toUpperCase() + location.name.slice(1)}
        </option>
      ))}
    </select>
  );
}
