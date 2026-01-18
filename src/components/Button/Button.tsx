import { cva } from '../../../styled-system/css'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

const buttonRecipe = cva({
  base: {
    borderRadius: '0.375rem',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 'medium',
    transition: 'background-color 0.2s',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    _disabled: {
      cursor: 'not-allowed',
      opacity: 0.6,
    },
  },
  variants: {
    variant: {
      primary: {
        backgroundColor: 'blue.500',
        color: 'white',
        _hover: {
          backgroundColor: 'blue.600',
        },
        _disabled: {
          backgroundColor: 'blue.500',
        },
      },
      secondary: {
        backgroundColor: 'gray.200',
        color: 'gray.800',
        _hover: {
          backgroundColor: 'gray.300',
        },
        _disabled: {
          backgroundColor: 'gray.200',
        },
      },
      danger: {
        backgroundColor: 'red.500',
        color: 'white',
        _hover: {
          backgroundColor: 'red.600',
        },
        _disabled: {
          backgroundColor: 'red.500',
        },
      },
      ghost: {
        backgroundColor: 'transparent',
        color: 'red.800',
        padding: '0.25rem 0.5rem',
        fontSize: '1.25rem',
        lineHeight: 1,
        _hover: {
          color: 'red.900',
        },
        _disabled: {
          color: 'red.800',
        },
      },
    },
    size: {
      small: {
        padding: '0.375rem 0.75rem',
        fontSize: '0.875rem',
      },
      medium: {
        padding: '0.75rem 1.5rem',
        fontSize: '1rem',
      },
      large: {
        padding: '1rem 2rem',
        fontSize: '1.125rem',
      },
    },
  },
  compoundVariants: [
    {
      variant: 'ghost',
      size: 'small',
      css: {
        padding: '0.25rem 0.5rem',
        fontSize: '1.25rem',
      },
    },
    {
      variant: 'ghost',
      size: 'medium',
      css: {
        padding: '0.25rem 0.5rem',
        fontSize: '1.25rem',
      },
    },
    {
      variant: 'ghost',
      size: 'large',
      css: {
        padding: '0.25rem 0.5rem',
        fontSize: '1.25rem',
      },
    },
  ],
  defaultVariants: {
    variant: 'primary',
    size: 'medium',
  },
})

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button variant style */
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  /** Button size */
  size?: 'small' | 'medium' | 'large'
  /** Show loading state */
  loading?: boolean
  /** Button content */
  children: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled,
  children,
  className,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading

  const buttonClassName = className
    ? `${buttonRecipe({ variant, size })} ${className}`
    : buttonRecipe({ variant, size })

  return (
    <button
      type={props.type || 'button'}
      disabled={isDisabled}
      className={buttonClassName}
      {...props}
    >
      {children}
    </button>
  )
}
