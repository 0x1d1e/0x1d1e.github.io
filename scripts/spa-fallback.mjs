// Static hosts (GitHub Pages) serve 404.html for unknown paths; reuse the SPA shell so /docs/... deep links work.
import { copyFileSync } from 'node:fs';
copyFileSync('dist/index.html', 'dist/404.html');
