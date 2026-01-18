import { sva } from '../../../styled-system/css'

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
      _hover: {
        opacity: 0.9,
      },
    },
  },
  variants: {
    variant: {
      scan: {
        root: {
          backgroundColor: 'blue.500',
          color: 'white',
        },
      },
      search: {
        root: {
          backgroundColor: 'orange.200',
          color: 'gray.800',
        },
      },
      voice: {
        root: {
          backgroundColor: 'red.200',
          color: 'gray.800',
        },
      },
      browse: {
        root: {
          backgroundColor: 'gray.300',
          color: 'gray.800',
        },
      },
      addItem: {
        root: {
          backgroundColor: 'green.300',
          color: 'gray.800',
        },
      },
    },
  },
  defaultVariants: {
    variant: 'scan',
  },
})

export type TileVariant = 'scan' | 'search' | 'voice' | 'browse' | 'addItem'
