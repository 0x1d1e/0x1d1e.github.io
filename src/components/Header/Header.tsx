import { useState } from 'react';
import { MobileMenu } from './MobileMenu';

export type NavLink = { label: string; href: string };

const MENU_ID = 'mobile-menu';

export function Header({ links }: { links: NavLink[] }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="absolute inset-x-0 top-[38px] z-40 flex items-center justify-between px-6 md:px-14">
      <a href="/" className="font-mono text-sm">
        0x1d1e
      </a>
      <nav aria-label="Primary" className="hidden gap-8 md:flex">
        {links.map((l) => (
          <a
            key={l.href}
            href={l.href}
            className="font-display text-sm text-text-soft hover:text-text"
          >
            {l.label}
          </a>
        ))}
      </nav>
      <button
        type="button"
        className="font-mono text-sm uppercase md:hidden"
        aria-expanded={open}
        aria-controls={MENU_ID}
        onClick={() => setOpen(true)}
      >
        Menu
      </button>
      {open && (
        <MobileMenu id={MENU_ID} links={links} onClose={() => setOpen(false)} />
      )}
    </header>
  );
}
