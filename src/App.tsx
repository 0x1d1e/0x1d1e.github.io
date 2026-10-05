import { Footer } from './components/Footer/Footer';
import { Header } from './components/Header/Header';
import { Hero } from './components/Hero/Hero';
import { Projects } from './components/Projects/Projects';
import { projects } from './content/projects';

const ORG = 'https://github.com/0x1d1e';

const nav = [
  { label: 'Projects', href: '#projects-title' },
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
      </main>
      <Footer links={footerLinks} />
    </>
  );
}
