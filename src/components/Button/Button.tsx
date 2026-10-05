import type { AnchorHTMLAttributes, ReactNode } from 'react';

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  arrow?: boolean;
  children: ReactNode;
};

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M4 12 12 4M5 4h7v7" />
    </svg>
  );
}

/** Square CTA. Renders a link because every CTA on the page navigates. */
export function Button({
  arrow = false,
  className = '',
  children,
  ...rest
}: Props) {
  return (
    <a
      className={`inline-flex items-center gap-2 rounded-btn bg-text px-5 py-3 font-display text-sm font-medium text-cta-text transition-colors duration-150 hover:bg-text-alt ${className}`}
      {...rest}
    >
      {children}
      {arrow && <ArrowIcon />}
    </a>
  );
}
