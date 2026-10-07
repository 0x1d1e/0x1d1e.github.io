import { useEffect } from 'react';
import { BuildLoop } from '../components/BuildLoop/BuildLoop';
import { Button } from '../components/Button/Button';
import { Chapter } from '../components/Chapter/Chapter';
import { Hero } from '../components/Hero/Hero';
import { Marquee } from '../components/Marquee/Marquee';
import { NeuralNet } from '../components/NeuralNet/NeuralNet';
import { Principles } from '../components/Principles/Principles';
import { Stage, type StagePage } from '../motion/Stage';

const values = [
  'build first',
  'verify things',
  'keep the useful parts',
  'no fake stability',
  'no roadmap theater',
];

// One story, in order: who we are, what we build, our AI research, how we work, how to join in.
const pages: StagePage[] = [
  {
    id: 'intro',
    label: 'Intro',
    exit: 'logo-scatter',
    scatterStyle: 'tunnel',
    span: 3.4, // the 3D scatter gets more scroll, so it plays slower
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
  {
    id: 'build',
    label: 'What we build',
    exit: 'agent-eat',
    span: 3.2, // the agent needs room to grow and eat
    command: 'cd ./what-we-build',
    node: (
      <Chapter
        id="build"
        index="01"
        label="what we build"
        title="Tools for the problems in front of us."
        blurb="We build solutions and tools in tech, and in AI where it helps: gateways, coding agents, developer tools, desktop software. Small, working, and honest about how finished they are."
        tags={[
          'developer tools',
          'AI and LLM',
          'agents and automation',
          'Linux desktop',
          'infrastructure',
        ]}
        cta={{ label: 'Browse projects', href: '/projects' }}
        visual={<BuildLoop />}
      />
    ),
  },
  {
    id: 'research',
    label: 'AI research',
    exit: 'fx',
    fxStyle: 'tokens',
    span: 3, // room for the effect to play
    command: 'cat ai-research.md',
    node: (
      <Chapter
        id="research"
        index="02"
        label="ai research"
        title="Train it. Measure it. Ship it."
        blurb="We also do AI research: training models, evaluating them, and deploying what holds up. Measurements beat guesses, so evals come before claims."
        tags={['training', 'evaluation', 'deployment', 'models']}
        cta={{ label: 'More about us', href: '/about' }}
        visual={<NeuralNet />}
      />
    ),
  },
  {
    id: 'principles',
    label: 'How we work',
    exit: 'fx',
    fxStyle: 'eval',
    span: 3,
    command: 'less PRINCIPLES.md',
    node: <Principles />,
  },
  {
    id: 'next',
    label: 'Join in',
    command: 'git clone 0x1d1e/you',
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
  // The stage is a long scroll: never restore a position in it (refresh, back).
  // Other pages get the browser's own behaviour back when this one goes.
  useEffect(() => {
    const before = history.scrollRestoration;
    history.scrollRestoration = 'manual';
    window.scrollTo({ top: 0, behavior: 'instant' });
    return () => {
      history.scrollRestoration = before === 'manual' ? 'auto' : before;
    };
  }, []);
  return <Stage pages={pages} />;
}
