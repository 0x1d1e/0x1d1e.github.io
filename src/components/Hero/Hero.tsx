import { Button } from '../Button/Button';
import { Reveal } from '../../motion/Reveal';
import { AgentLoop } from './AgentLoop';

export type HeroProps = {
  headline: string;
  subtext: string;
  cta: { label: string; href: string };
};

export function Hero({ headline, subtext, cta }: HeroProps) {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative flex min-h-svh items-end overflow-hidden bg-bg"
    >
      <div aria-hidden="true" className="scrim absolute inset-0" />
      <div className="relative z-10 grid w-full items-end gap-12 px-6 pb-16 md:px-14 md:pb-24 lg:grid-cols-2">
        <div className="flex max-w-3xl flex-col gap-6">
          <Reveal>
            <h1 id="hero-title" className="font-display text-headline">
              {headline}
            </h1>
          </Reveal>
          <Reveal delay={0.06}>
            <p className="font-mono text-sm text-muted">{subtext}</p>
          </Reveal>
          <Reveal delay={0.12}>
            <Button href={cta.href} arrow>
              {cta.label}
            </Button>
          </Reveal>
        </div>
        <Reveal delay={0.18} className="lg:justify-self-end">
          <AgentLoop />
        </Reveal>
      </div>
    </section>
  );
}
