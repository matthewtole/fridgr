import { cva } from '../../../styled-system/css';
import type { InputHTMLAttributes } from 'react';

const textInputRecipe = cva({
  base: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid',
    borderRadius: '0.375rem',
    fontSize: '1rem',
    _focus: {
      outline: 'none',
      borderColor: 'blue.500',
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
    },
  },
  variants: {
    error: {
      true: {
        borderColor: 'red.300',
      },
      false: {
        borderColor: 'gray.300',
      },
    },
  },
  defaultVariants: {
    error: false,
  },
});

export interface TextInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size'
> {
  /** Show error state */
  error?: boolean;
}

export function TextInput({
  error = false,
  className,
  ...props
}: TextInputProps) {
  const inputClassName = className
    ? `${textInputRecipe({ error })} ${className}`
    : textInputRecipe({ error });

  return <input className={inputClassName} {...props} />;
}
