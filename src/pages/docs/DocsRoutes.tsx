import { Navigate, Route, Routes, useParams } from 'react-router';
import { docs, docsByProject, getDoc } from '../../content/docs';
import { NotFound } from '../NotFound';
import { DocPage } from './DocPage';
import { DocsHome } from './DocsHome';
import { DocsLayout } from './DocsLayout';

function ProjectRedirect() {
  const { project = '' } = useParams();
  const first = docsByProject.get(project)?.[0];
  return first ? <Navigate to={`/docs/${project}/${first.slug}`} replace /> : <NotFound />;
}

function Page() {
  const { project = '', slug = '' } = useParams();
  const doc = getDoc(project, slug);
  return doc ? <DocPage doc={doc} /> : <NotFound />;
}

export default function DocsRoutes() {
  return (
    <DocsLayout docs={docs}>
      <Routes>
        <Route index element={<DocsHome />} />
        <Route path=":project" element={<ProjectRedirect />} />
        <Route path=":project/:slug" element={<Page />} />
      </Routes>
    </DocsLayout>
  );
}
