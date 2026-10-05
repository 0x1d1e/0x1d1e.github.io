import { Hero } from '../components/Hero/Hero';
import { Marquee } from '../components/Marquee/Marquee';
import { Projects } from '../components/Projects/Projects';
import { projects } from '../content/projects';

const values = [
  'build first',
  'verify things',
  'keep the useful parts',
  'no fake stability',
  'no roadmap theater',
];

export function Home() {
  return (
    <>
      <Hero
        headline="0x1d1e"
        subtext="software made during idle cycles"
        cta={{ label: 'See the projects', href: '#projects-title' }}
      />
      <Marquee items={values} />
      <Projects projects={projects} />
    </>
  );
}
