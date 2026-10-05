import type { HTMLAttributes } from 'react';

export function Card({
  className = '',
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={`bg-card ring-1 ring-ring ${className}`} {...rest} />;
}
