import type { AnchorHTMLAttributes } from 'react';
import { Link, useInRouterContext } from 'react-router';

/** Client-side navigation for in-app paths ("/docs"); plain anchor otherwise. */
export function AppLink({
  href = '',
  children,
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const routed = useInRouterContext();
  if (routed && href.startsWith('/'))
    return (
      <Link to={href} {...rest}>
        {children}
      </Link>
    );
  return (
    <a href={href} {...rest}>
      {children}
    </a>
  );
}
