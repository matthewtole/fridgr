import { useMutation } from '@tanstack/react-query';
import { lookupProductByBarcode } from '../lib/queries/products';

export function useLookupProductByBarcode() {
  return useMutation({
    mutationFn: lookupProductByBarcode,
  });
}
