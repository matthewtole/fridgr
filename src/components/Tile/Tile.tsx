import { ButtonHTMLAttributes, ReactNode } from 'react'
import { cx } from '../../../styled-system/css'
import { tileRecipe, TileVariant } from './Tile.recipe'

export interface TileProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: TileVariant
  icon?: ReactNode
  label: ReactNode
  className?: string
}

export function Tile({
  variant = 'scan',
  icon,
  label,
  className,
  type = 'button',
  ...props
}: TileProps) {
  const classes = tileRecipe({ variant })

  return (
    <button type={type} className={cx(classes.root, className)} {...props}>
      <span className={classes.icon}>{icon}</span>
      <span className={classes.label}>{label}</span>
    </button>
  )
}
