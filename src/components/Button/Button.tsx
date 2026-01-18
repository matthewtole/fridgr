import { cva } from '../../../styled-system/css';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const colors = [
  'lemon',
  'peach',
  'rose',
  'orchid',
  'mauve',
  'sky',
  'frost',
  'aqua',
  'aquamarine',
  'mint',
] as const;

// Explicit compoundVariants with literal token strings so Panda's static extractor
// can find and emit the color token CSS (--colors-lemon, etc.). Using .map() or
// variables like backgroundColor: color prevents extraction.
const solidExtras = {
  color: 'gray.800',
  _hover: { filter: 'brightness(0.97)' },
};
const lightExtras = {
  color: 'gray.800',
  _hover: { filter: 'brightness(1.04)' },
};

const buttonRecipe = cva({
  base: {
    borderRadius: '8px',
    border: '1.5px solid transparent',
    boxSizing: 'border-box',
    cursor: 'pointer',
    fontWeight: 'medium',
    transition: 'background-color 0.2s, color 0.2s, border-color 0.2s',
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
      solid: {},
      outline: {},
      light: {},
      ghost: {},
    },
    color: {
      lemon: {},
      peach: {},
      rose: {},
      orchid: {},
      mauve: {},
      sky: {},
      frost: {},
      aqua: {},
      aquamarine: {},
      mint: {},
    },
    size: {
      small: {
        padding: '4px 8px',
        fontSize: '12px',
        borderRadius: '4px',
      },
      medium: {
        padding: '8px 16px',
        fontSize: '14px',
        borderRadius: '6px',
      },
      large: {
        padding: '16px 32px',
        fontSize: '16px',
        borderRadius: '8px',
      },
    },
  },
  compoundVariants: [
    // solid – backgroundColor must be a literal for extraction
    {
      variant: 'solid',
      color: 'lemon',
      css: { backgroundColor: 'lemon', ...solidExtras },
    },
    {
      variant: 'solid',
      color: 'peach',
      css: { backgroundColor: 'peach', ...solidExtras },
    },
    {
      variant: 'solid',
      color: 'rose',
      css: { backgroundColor: 'rose', ...solidExtras },
    },
    {
      variant: 'solid',
      color: 'orchid',
      css: { backgroundColor: 'orchid', ...solidExtras },
    },
    {
      variant: 'solid',
      color: 'mauve',
      css: { backgroundColor: 'mauve', ...solidExtras },
    },
    {
      variant: 'solid',
      color: 'sky',
      css: { backgroundColor: 'sky', ...solidExtras },
    },
    {
      variant: 'solid',
      color: 'frost',
      css: { backgroundColor: 'frost', ...solidExtras },
    },
    {
      variant: 'solid',
      color: 'aqua',
      css: { backgroundColor: 'aqua', ...solidExtras },
    },
    {
      variant: 'solid',
      color: 'aquamarine',
      css: { backgroundColor: 'aquamarine', ...solidExtras },
    },
    {
      variant: 'solid',
      color: 'mint',
      css: { backgroundColor: 'mint', ...solidExtras },
    },
    // outline – borderColor literal for extraction
    {
      variant: 'outline',
      color: 'lemon',
      css: {
        // border: '1px solid',
        borderColor: 'lemon',
        backgroundColor: 'transparent',
        color: 'gray.800',
        _hover: { backgroundColor: 'gray.50' },
      },
    },
    {
      variant: 'outline',
      color: 'peach',
      css: {
        // border: '1px solid',
        borderColor: 'peach',
        backgroundColor: 'transparent',
        color: 'gray.800',
        _hover: { backgroundColor: 'gray.50' },
      },
    },
    {
      variant: 'outline',
      color: 'rose',
      css: {
        // border: '1px solid',
        borderColor: 'rose',
        backgroundColor: 'transparent',
        color: 'gray.800',
        _hover: { backgroundColor: 'gray.50' },
      },
    },
    {
      variant: 'outline',
      color: 'orchid',
      css: {
        // border: '1px solid',
        borderColor: 'orchid',
        backgroundColor: 'transparent',
        color: 'gray.800',
        _hover: { backgroundColor: 'gray.50' },
      },
    },
    {
      variant: 'outline',
      color: 'mauve',
      css: {
        // border: '1px solid',
        borderColor: 'mauve',
        backgroundColor: 'transparent',
        color: 'gray.800',
        _hover: { backgroundColor: 'gray.50' },
      },
    },
    {
      variant: 'outline',
      color: 'sky',
      css: {
        // border: '1px solid',
        borderColor: 'sky',
        backgroundColor: 'transparent',
        color: 'gray.800',
        _hover: { backgroundColor: 'gray.50' },
      },
    },
    {
      variant: 'outline',
      color: 'frost',
      css: {
        // border: '1px solid',
        borderColor: 'frost',
        backgroundColor: 'transparent',
        color: 'gray.800',
        _hover: { backgroundColor: 'gray.50' },
      },
    },
    {
      variant: 'outline',
      color: 'aqua',
      css: {
        // border: '1px solid',
        borderColor: 'aqua',
        backgroundColor: 'transparent',
        color: 'gray.800',
        _hover: { backgroundColor: 'gray.50' },
      },
    },
    {
      variant: 'outline',
      color: 'aquamarine',
      css: {
        // border: '1px solid',
        borderColor: 'aquamarine',
        backgroundColor: 'transparent',
        color: 'gray.800',
        _hover: { backgroundColor: 'gray.50' },
      },
    },
    {
      variant: 'outline',
      color: 'mint',
      css: {
        // border: '1px solid',
        borderColor: 'mint',
        backgroundColor: 'transparent',
        color: 'gray.800',
        _hover: { backgroundColor: 'gray.50' },
      },
    },
    // light
    {
      variant: 'light',
      color: 'lemon',
      css: { backgroundColor: 'lemon', ...lightExtras },
    },
    {
      variant: 'light',
      color: 'peach',
      css: { backgroundColor: 'peach', ...lightExtras },
    },
    {
      variant: 'light',
      color: 'rose',
      css: { backgroundColor: 'rose', ...lightExtras },
    },
    {
      variant: 'light',
      color: 'orchid',
      css: { backgroundColor: 'orchid', ...lightExtras },
    },
    {
      variant: 'light',
      color: 'mauve',
      css: { backgroundColor: 'mauve', ...lightExtras },
    },
    {
      variant: 'light',
      color: 'sky',
      css: { backgroundColor: 'sky', ...lightExtras },
    },
    {
      variant: 'light',
      color: 'frost',
      css: { backgroundColor: 'frost', ...lightExtras },
    },
    {
      variant: 'light',
      color: 'aqua',
      css: { backgroundColor: 'aqua', ...lightExtras },
    },
    {
      variant: 'light',
      color: 'aquamarine',
      css: { backgroundColor: 'aquamarine', ...lightExtras },
    },
    {
      variant: 'light',
      color: 'mint',
      css: { backgroundColor: 'mint', ...lightExtras },
    },
    // ghost – color literal for extraction
    {
      variant: 'ghost',
      color: 'lemon',
      css: {
        backgroundColor: 'transparent',
        color: 'lemon',
        _hover: { backgroundColor: 'gray.100' },
      },
    },
    {
      variant: 'ghost',
      color: 'peach',
      css: {
        backgroundColor: 'transparent',
        color: 'peach',
        _hover: { backgroundColor: 'gray.100' },
      },
    },
    {
      variant: 'ghost',
      color: 'rose',
      css: {
        backgroundColor: 'transparent',
        color: 'rose',
        _hover: { backgroundColor: 'gray.100' },
      },
    },
    {
      variant: 'ghost',
      color: 'orchid',
      css: {
        backgroundColor: 'transparent',
        color: 'orchid',
        _hover: { backgroundColor: 'gray.100' },
      },
    },
    {
      variant: 'ghost',
      color: 'mauve',
      css: {
        backgroundColor: 'transparent',
        color: 'mauve',
        _hover: { backgroundColor: 'gray.100' },
      },
    },
    {
      variant: 'ghost',
      color: 'sky',
      css: {
        backgroundColor: 'transparent',
        color: 'sky',
        _hover: { backgroundColor: 'gray.100' },
      },
    },
    {
      variant: 'ghost',
      color: 'frost',
      css: {
        backgroundColor: 'transparent',
        color: 'frost',
        _hover: { backgroundColor: 'gray.100' },
      },
    },
    {
      variant: 'ghost',
      color: 'aqua',
      css: {
        backgroundColor: 'transparent',
        color: 'aqua',
        _hover: { backgroundColor: 'gray.100' },
      },
    },
    {
      variant: 'ghost',
      color: 'aquamarine',
      css: {
        backgroundColor: 'transparent',
        color: 'aquamarine',
        _hover: { backgroundColor: 'gray.100' },
      },
    },
    {
      variant: 'ghost',
      color: 'mint',
      css: {
        backgroundColor: 'transparent',
        color: 'mint',
        _hover: { backgroundColor: 'gray.100' },
      },
    },
  ],
  defaultVariants: {
    variant: 'solid',
    color: 'sky',
    size: 'medium',
  },
});

export type ButtonVariant = 'solid' | 'outline' | 'light' | 'ghost';
export type ButtonColor = (typeof colors)[number];

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style: solid fill, outline, light tint, or ghost (transparent) */
  variant?: ButtonVariant;
  /** Color from the palette */
  color?: ButtonColor;
  /** Button size */
  size?: 'small' | 'medium' | 'large';
  /** Show loading state */
  loading?: boolean;
  /** Button content */
  children: ReactNode;
}

export function Button({
  variant = 'outline',
  color = 'sky',
  size = 'medium',
  loading = false,
  disabled,
  children,
  className,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const buttonClassName = className
    ? `${buttonRecipe({ variant, color, size })} ${className}`
    : buttonRecipe({ variant, color, size });

  return (
    <button
      type={props.type || 'button'}
      disabled={isDisabled}
      className={buttonClassName}
      {...props}
    >
      {children}
    </button>
  );
}
