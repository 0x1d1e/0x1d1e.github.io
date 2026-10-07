import { Button } from '../Button/Button';
import { PixelWordmark } from '../PixelWordmark/PixelWordmark';
import { Cursor } from '../Cursor/Cursor';
import { Reveal } from '../../motion/Reveal';
import { useTypewriter } from '../../motion/useTypewriter';
import { AgentLoop } from './AgentLoop';
import { HeroBot } from './HeroBot';

export type HeroProps = {
  headline: string;
  subtext: string;
  cta: { label: string; href: string };
};

export function Hero({ headline, subtext, cta }: HeroProps) {
  const s = useTypewriter(subtext, { delay: 900, speed: 35 });

  return (
    <section
      aria-labelledby="hero-title"
      className="relative flex min-h-svh items-end lg:min-h-[calc(100svh-6.25rem)] overflow-hidden"
    >
      <div aria-hidden="true" className="scrim absolute inset-0" />
      <div className="relative z-10 grid w-full items-end gap-12 px-6 pt-28 pb-16 md:px-14 md:pb-24 lg:grid-cols-2 lg:pt-0">
        <div className="flex max-w-5xl flex-col gap-6">
          <h1 id="hero-title" className="font-display text-headline">
            <PixelWordmark text={headline} />
          </h1>
          <p className="font-mono text-sm text-muted">
            <span className="sr-only">{subtext}</span>
            <span aria-hidden="true">
              {s.typed}
              <Cursor />
            </span>
          </p>
          <Reveal delay={0.12}>
            <Button href={cta.href} arrow>
              {cta.label}
            </Button>
          </Reveal>
        </div>
        <div className="flex w-full max-w-md flex-col lg:justify-self-end">
          {/* The bot stands on the card: its feet on the card's top edge. */}
          <Reveal delay={0.1} className="-mb-px self-end pr-5 sm:pr-8">
            <HeroBot />
          </Reveal>
          <Reveal delay={0.18}>
            <AgentLoop />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
