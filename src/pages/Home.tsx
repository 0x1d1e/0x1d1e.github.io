import { Button } from '../components/Button/Button';
import { Chapter } from '../components/Chapter/Chapter';
import { Hero } from '../components/Hero/Hero';
import { IslandDemo } from '../components/IslandDemo/IslandDemo';
import { Marquee } from '../components/Marquee/Marquee';
import { PipelineAgents } from '../components/PipelineAgents/PipelineAgents';
import { Principles } from '../components/Principles/Principles';
import { RouteGraph } from '../components/RouteGraph/RouteGraph';
import { Stage, type StagePage } from '../motion/Stage';

const values = [
  'build first',
  'verify things',
  'keep the useful parts',
  'no fake stability',
  'no roadmap theater',
];

// One story, in order: who we are, what we build (one page each), how we work, how to join in.
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
  {
    id: 'kinetix',
    label: 'Kinetix',
    node: (
      <Chapter
        index="01"
        project="kinetix"
        title="LLM traffic, in motion."
        blurb="A self-hosted LLM gateway for coding agents and small technical teams. OpenAI- and Anthropic-compatible APIs sit in front of your providers, with virtual keys, routes, automatic fallback and usage tracking, in a single Rust binary."
        tags={['LLM gateway', 'Rust', 'self-hosted', 'WASM plugins']}
        visual={<RouteGraph />}
      />
    ),
  },
  {
    id: 'merro',
    label: 'Merro',
    node: (
      <Chapter
        index="02"
        project="merro"
        title="Backlog to merged PR."
        blurb="A multi-agent coding orchestrator for Pi. One main agent plans the work; sandboxed implementers and independent reviewers run visibly in tmux until the change is reviewed and merged."
        tags={['coding agents', 'TypeScript', 'tmux', 'git worktrees']}
        visual={<PipelineAgents />}
      />
    ),
  },
  {
    id: 'kanade',
    label: 'Kanade',
    node: (
      <Chapter
        index="03"
        project="kanade"
        title="A Dynamic Island for niri."
        blurb="A top-center island for the niri Wayland compositor, built with Amane. It sits quietly at the top of the screen and expands when you need it."
        tags={['Linux desktop', 'Rust', 'niri', 'Wayland']}
        visual={<IslandDemo />}
      />
    ),
  },
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
