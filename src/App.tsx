import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { Outlet, Route, Routes, useLocation } from 'react-router';
import { Footer } from './components/Footer/Footer';
import { Header } from './components/Header/Header';
import { Intro, shouldPlayIntro } from './components/Intro/Intro';
import { PixelField } from './components/PixelField/PixelField';
import { ScrollProgress } from './components/ScrollProgress/ScrollProgress';
import { PageTransition } from './motion/PageTransition';
import { About } from './pages/About';
import { Home } from './pages/Home';
import { ProjectsPage } from './pages/ProjectsPage';
import { NotFound } from './pages/NotFound';

// Docs (markdown renderer + content) stay out of the landing bundle.
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
const DocsRoutes = lazy(() => import('./pages/docs/DocsRoutes'));

const ORG = 'https://github.com/0x1d1e';

const nav = [
  { label: 'Projects', href: '/projects' },
  { label: 'About', href: '/about' },
  { label: 'Docs', href: '/docs' },
  { label: 'GitHub', href: ORG },
];

const footerLinks = [
  { label: 'About', href: '/about' },
  { label: 'Docs', href: '/docs' },
  { label: 'Contributing', href: `${ORG}/.github/blob/main/CONTRIBUTING.md` },
  { label: 'Security', href: `${ORG}/.github/blob/main/SECURITY.md` },
  { label: 'GitHub', href: ORG },
];

const noop = () => undefined;

/** Hash links scroll to their target; other navigations start at the top. */
function ScrollToHash() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
    else window.scrollTo({ top: 0, behavior: 'instant' }); // page changes never glide
  }, [pathname, hash]);
  return null;
}

function Shell() {
  const { pathname } = useLocation();
  // Decided once, on the first render: deep links go straight to their page.
  const [intro, setIntro] = useState(() =>
    shouldPlayIntro(pathname, window.location.search),
  );
  // The page is mounted under the video (real content for crawlers); the
  // video's wordmark glides down onto the hero's own.
  const gone = useCallback(() => setIntro(false), []);
  return (
    <>
      {intro && <Intro onClose={noop} onGone={gone} />}
      <PixelField />
      <ScrollProgress />
      <ScrollToHash />
      <Header links={nav} />
      <main className="overflow-x-clip text-text">
        <PageTransition key={pathname}>
          <Suspense fallback={<div className="min-h-svh" />}>
            <Outlet />
          </Suspense>
        </PageTransition>
      </main>
      <Footer links={footerLinks} />
    </>
  );
}

export function App() {
  return (
    <Routes>
      <Route element={<Shell />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="projects/:name" element={<ProjectDetail />} />
        <Route path="docs/*" element={<DocsRoutes />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
