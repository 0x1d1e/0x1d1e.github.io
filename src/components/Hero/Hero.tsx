import { Button } from '../Button/Button';

export type HeroProps = {
  headline: string;
  subtext: string;
  cta: { label: string; href: string };
};

/** Full-viewport hero. No photo yet (see PLAN risk 2): the scrim sits over the black canvas. */
export function Hero({ headline, subtext, cta }: HeroProps) {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative flex min-h-svh items-end overflow-hidden bg-bg"
    >
      <div aria-hidden="true" className="scrim absolute inset-0" />
      <div className="relative z-10 flex max-w-3xl flex-col gap-6 px-6 pb-16 md:px-14 md:pb-24">
        <h1 id="hero-title" className="font-display text-headline">
          {headline}
        </h1>
        <p className="font-mono text-sm text-muted">{subtext}</p>
        <div>
          <Button href={cta.href} arrow>
            {cta.label}
          </Button>
        </div>
      </div>
    </section>
  );
}
