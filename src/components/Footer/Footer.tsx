import { AppLink } from '../AppLink/AppLink';

export type FooterLink = { label: string; href: string };

export function Footer({ links }: { links: FooterLink[] }) {
  return (
    <footer className="border-t border-ring px-6 py-12 md:px-14">
      <nav aria-label="Footer" className="flex flex-wrap gap-8">
        {links.map((l) => (
          <AppLink
            key={l.href}
            href={l.href}
            className="font-mono text-sm text-muted hover:text-text after:ml-1.5 after:inline-block after:h-3 after:w-1.5 after:bg-accent after:opacity-0 hover:after:animate-blink hover:after:opacity-100 focus-visible:after:opacity-100"
          >
            {l.label}
          </AppLink>
        ))}
      </nav>
    </footer>
  );
}
