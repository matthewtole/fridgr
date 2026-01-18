import { sva } from '../../../styled-system/css';

// Uses the same color tokens as Button (lemon, peach, rose, orchid, mauve, sky,
// frost, aqua, aquamarine, mint). Semantic variants map to the palette.
export const tileRecipe = sva({
  slots: ['root', 'icon', 'label'],
  base: {
    root: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1',
      width: '100%',
      borderRadius: 'xl',
      border: 'none',
      padding: '4',
      minHeight: '6rem',
      cursor: 'pointer',
      fontWeight: 'bold',
      transition: 'background-color 0.2s',
      color: 'gray.800',
      textDecoration: 'none',
      _hover: { filter: 'brightness(0.97)' },
    },
  },
  variants: {
    variant: {
      scan: { root: { backgroundColor: 'sky' } },
      search: { root: { backgroundColor: 'peach' } },
      voice: { root: { backgroundColor: 'rose' } },
      browse: { root: { backgroundColor: 'mauve' } },
      addItem: { root: { backgroundColor: 'mint' } },
    },
  },
  defaultVariants: {
    variant: 'scan',
  },
});

export type TileVariant = 'scan' | 'search' | 'voice' | 'browse' | 'addItem';
