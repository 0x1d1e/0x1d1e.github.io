import type { ReactNode } from 'react';
import { Button } from '../components/Button/Button';
import { Chapter } from '../components/Chapter/Chapter';
import { Hero } from '../components/Hero/Hero';
import { topics, type TopicId } from '../content/topics';
import { AgentSwarm } from '../components/AgentSwarm/AgentSwarm';
import { Marquee } from '../components/Marquee/Marquee';
import { NeuralNet } from '../components/NeuralNet/NeuralNet';
import { Principles } from '../components/Principles/Principles';
import { TilingDemo } from '../components/TilingDemo/TilingDemo';
import { Stage, type StagePage } from '../motion/Stage';

const values = [
  'build first',
  'verify things',
  'keep the useful parts',
  'no fake stability',
  'no roadmap theater',
];

// What each kind of work looks like. Illustrations are generic; project-specific ones live on each project's page.
const visualFor: Record<TopicId, ReactNode> = {
  ai: <NeuralNet />,
  agents: <AgentSwarm />,
  desktop: <TilingDemo />,
};

// One story, in order: who we are, what kind of work we do, how we work, how to join in.
const pages: StagePage[] = [
  {
    id: 'intro',
    label: 'Intro',
    node: (
      <div className="relative">
        <Hero
          headline="0x1d1e"
          subtext="software made during idle cycles"
          cta={{ label: 'See the projects', href: '/projects' }}
        />
        <div className="absolute inset-x-0 bottom-0">
          <Marquee items={values} />
        </div>
      </div>
    ),
  },
  ...topics.map((t, i): StagePage => ({
    id: t.id,
    label: t.name,
    node: (
      <Chapter
        index={String(i + 1).padStart(2, '0')}
        topic={t.id}
        name={t.name}
        title={t.title}
        blurb={t.blurb}
        tags={t.tags}
        visual={visualFor[t.id]}
      />
    ),
  })),
  { id: 'principles', label: 'How we work', node: <Principles /> },
  {
    id: 'next',
    label: 'Join in',
    node: (
      <section
        aria-labelledby="next-title"
        className="flex flex-col gap-6 px-6 py-24 md:px-14 lg:py-0"
      >
        <h2 id="next-title" className="font-display text-headline">
          Read the code. Break it.
        </h2>
        <p className="max-w-xl text-text-soft">
          Bug reports, experiments, fixes, criticism, benchmarks and weird ideas
          are welcome.
        </p>
        <div className="flex flex-wrap gap-4">
          <Button href="/docs" arrow>
            Read the docs
          </Button>
          <Button href="/about" arrow>
            About us
          </Button>
        </div>
      </section>
    ),
  },
];

export function Home() {
  return <Stage pages={pages} />;
}
