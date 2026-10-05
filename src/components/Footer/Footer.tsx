export type FooterLink = { label: string; href: string };

export function Footer({ links }: { links: FooterLink[] }) {
  return (
    <footer className="border-t border-ring px-6 py-12 md:px-14">
      <nav aria-label="Footer" className="flex flex-wrap gap-8">
        {links.map((l) => (
          <a
            key={l.href}
            href={l.href}
            className="font-mono text-sm text-muted hover:text-text"
          >
            {l.label}
          </a>
        ))}
      </nav>
    </footer>
  );
}
