import { lazy, Suspense, useEffect } from 'react';
import { Outlet, Route, Routes, useLocation } from 'react-router';
import { Footer } from './components/Footer/Footer';
import { Header } from './components/Header/Header';
import { PixelField } from './components/PixelField/PixelField';
import { ScrollProgress } from './components/ScrollProgress/ScrollProgress';
import { PageTransition } from './motion/PageTransition';
import { Home } from './pages/Home';
import { NotFound } from './pages/NotFound';

// Docs (markdown renderer + content) stay out of the landing bundle.
const DocsRoutes = lazy(() => import('./pages/docs/DocsRoutes'));

const ORG = 'https://github.com/0x1d1e';

const nav = [
  { label: 'Projects', href: '/#projects-title' },
  { label: 'Docs', href: '/docs' },
  { label: 'GitHub', href: ORG },
];

const footerLinks = [
  { label: 'Docs', href: '/docs' },
  { label: 'Contributing', href: `${ORG}/.github/blob/main/CONTRIBUTING.md` },
  { label: 'Security', href: `${ORG}/.github/blob/main/SECURITY.md` },
  { label: 'GitHub', href: ORG },
];

/** Hash links scroll to their target; other navigations start at the top. */
function ScrollToHash() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
    else window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

function Shell() {
  const { pathname } = useLocation();
  return (
    <>
      <PixelField />
      <ScrollProgress />
      <ScrollToHash />
      <Header links={nav} />
      <main className="text-text">
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
        <Route path="docs/*" element={<DocsRoutes />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
