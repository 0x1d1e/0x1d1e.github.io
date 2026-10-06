import { useState } from 'react';
import { AppLink } from '../AppLink/AppLink';
import { MobileMenu } from './MobileMenu';

export type NavLink = { label: string; href: string };

const MENU_ID = 'mobile-menu';

export function Header({ links }: { links: NavLink[] }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="scrim-top fixed inset-x-0 top-0 z-40 flex items-center justify-between px-6 pt-[38px] pb-8 md:px-14">
      <a href="/" className="font-mono text-sm">
        0x1d1e
      </a>
      <nav aria-label="Primary" className="hidden gap-8 md:flex">
        {links.map((l) => (
          <AppLink
            key={l.href}
            href={l.href}
            className="font-display text-sm text-text-soft hover:text-text after:ml-1.5 after:inline-block after:h-3 after:w-1.5 after:bg-accent after:opacity-0 hover:after:animate-blink hover:after:opacity-100 focus-visible:after:opacity-100"
          >
            {l.label}
          </AppLink>
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
