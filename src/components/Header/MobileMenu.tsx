import { useEffect, useRef } from 'react';
import { AppLink } from '../AppLink/AppLink';
import type { NavLink } from './Header';

const FOCUSABLE = 'a[href], button:not([disabled])';

type Props = { id: string; links: NavLink[]; onClose: () => void };

/** Full-screen dialog: locks body scroll, traps focus, closes on Escape. */
export function MobileMenu({ id, links, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    ref.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();

    return () => {
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, []);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      onClose();
      return;
    }
    if (e.key !== 'Tab') return;
    const items = ref.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
    if (!items?.length) return;
    const first = items[0]!;
    const last = items[items.length - 1]!;
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  return (
    // Keyboard handling (Escape, Tab trap) is the point of a modal dialog.
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <div
      ref={ref}
      id={id}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      onKeyDown={onKeyDown}
      className="fixed inset-0 z-50 flex flex-col bg-bg px-6 pt-[38px]"
    >
      <button
        type="button"
        onClick={onClose}
        className="self-end font-mono text-sm uppercase"
      >
        Close
      </button>
      <nav aria-label="Mobile" className="mt-16 flex flex-col gap-6">
        {links.map((l) => (
          <AppLink
            key={l.href}
            href={l.href}
            onClick={onClose}
            className="font-display text-headline"
          >
            {l.label}
          </AppLink>
        ))}
      </nav>
    </div>
  );
}
