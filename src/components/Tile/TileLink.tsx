import type { ReactNode } from 'react';
import { Link, type LinkProps } from '@tanstack/react-router';
import { cx } from '../../../styled-system/css';
import { tileRecipe, type TileVariant } from './Tile.recipe';

export interface TileLinkProps extends Omit<
  LinkProps,
  'children' | 'className' | 'to'
> {
  to: NonNullable<LinkProps['to']>;
  variant?: TileVariant;
  icon?: ReactNode;
  label: ReactNode;
  className?: string;
}

export function TileLink({
  to,
  variant = 'scan',
  icon,
  label,
  className,
  ...linkProps
}: TileLinkProps) {
  const classes = tileRecipe({ variant });

  return (
    <Link to={to} className={cx(classes.root, className)} {...linkProps}>
      <span className={classes.icon}>{icon}</span>
      <span className={classes.label}>{label}</span>
    </Link>
  );
}
