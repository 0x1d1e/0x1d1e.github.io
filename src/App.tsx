import {
  Bento,
  ClusteringCard,
  RegressionCard,
  VersionReplayCard,
} from './components/Bento/Bento';
import { EventStream } from './components/EventStream/EventStream';
import { Footer } from './components/Footer/Footer';
import { Header } from './components/Header/Header';
import { Hero } from './components/Hero/Hero';
import { MetricsGrid } from './components/MetricsGrid/MetricsGrid';
import { Projects } from './components/Projects/Projects';
import { projects } from './content/projects';
import {
  clusters,
  metrics,
  regressions,
  replayDiff,
  traces,
} from './data/fixtures';

const ORG = 'https://github.com/0x1d1e';

const nav = [
  { label: 'Projects', href: '#projects-title' },
  { label: 'Events', href: '#events-title' },
  { label: 'GitHub', href: ORG },
];

const footerLinks = [
  { label: 'Contributing', href: `${ORG}/.github/blob/main/CONTRIBUTING.md` },
  { label: 'Security', href: `${ORG}/.github/blob/main/SECURITY.md` },
  { label: 'GitHub', href: ORG },
];

export function App() {
  return (
    <>
      <Header links={nav} />
      <main className="bg-bg text-text">
        <Hero
          headline="0x1d1e"
          subtext="software made during idle cycles"
          cta={{ label: 'See the projects', href: '#projects-title' }}
        />
        <Projects projects={projects} />
        <EventStream traces={traces} />
        <Bento>
          <RegressionCard items={regressions} />
          <ClusteringCard items={clusters} />
          <VersionReplayCard lines={replayDiff} />
        </Bento>
        <MetricsGrid metrics={metrics} />
      </main>
      <Footer links={footerLinks} />
    </>
  );
}
