import { AppLink } from '../components/AppLink/AppLink';
import { Cursor } from '../components/Cursor/Cursor';
import { NOT_FOUND } from '../seo/pageMeta';
import { useMeta } from '../seo/useMeta';

export function NotFound() {
  useMeta(NOT_FOUND);
  return (
    <section className="flex min-h-svh flex-col justify-center gap-4 px-6 md:px-14">
      <p aria-hidden="true" className="font-mono text-xs text-muted">
        $ cd ./this-page
        <Cursor />
      </p>
      <h1 className="font-display text-headline">Not found</h1>
      <p className="font-mono text-sm text-muted">
        exit 127: nothing lives at this path.
      </p>
      <AppLink
        href="/"
        className="font-mono text-sm text-accent hover:underline"
      >
        ← back to /
      </AppLink>
    </section>
  );
}
