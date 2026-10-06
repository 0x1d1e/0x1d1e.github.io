import { AiSection } from '../components/AiSection/AiSection';
import { Button } from '../components/Button/Button';
import { Hero } from '../components/Hero/Hero';
import { Marquee } from '../components/Marquee/Marquee';
import { PageDots } from '../components/PageDots/PageDots';
import { Principles } from '../components/Principles/Principles';
import { Projects } from '../components/Projects/Projects';
import { projects } from '../content/projects';
import { Reveal } from '../motion/Reveal';
import { Sheet } from '../motion/Sheet';

const values = [
  'build first',
  'verify things',
  'keep the useful parts',
  'no fake stability',
  'no roadmap theater',
];

const pages = [
  { id: 'hero', label: 'Intro' },
  { id: 'projects', label: 'Projects' },
  { id: 'ai', label: 'AI infrastructure' },
  { id: 'principles', label: 'How we work' },
  { id: 'next', label: 'Next' },
];

export function Home() {
  return (
    <>
      <PageDots items={pages} />
      <Sheet id="hero">
        <Hero
          headline="0x1d1e"
          subtext="software made during idle cycles"
          cta={{ label: 'See the projects', href: '#projects-title' }}
        />
        <Marquee items={values} />
      </Sheet>
      <Sheet id="projects" label="01 / projects">
        <Projects projects={projects} />
      </Sheet>
      <Sheet id="ai" label="02 / ai">
        <AiSection />
      </Sheet>
      <Sheet id="principles" label="03 / principles">
        <Principles />
      </Sheet>
      <Sheet id="next" label="04 / next">
        <section
          aria-labelledby="next-title"
          className="flex min-h-[70svh] flex-col justify-center gap-6 px-6 py-24 md:px-14"
        >
          <Reveal>
            <h2 id="next-title" className="font-display text-headline">
              Read the code. Break it.
            </h2>
            <p className="mt-4 max-w-xl text-text-soft">
              Bug reports, experiments, fixes, criticism, benchmarks and weird
              ideas are welcome.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button href="/docs" arrow>
                Read the docs
              </Button>
              <Button href="/about" arrow>
                About us
              </Button>
            </div>
          </Reveal>
        </section>
      </Sheet>
    </>
  );
}
