// Turns the static build into standalone pages under rendered/: CSS inlined, scripts dropped,
// so each page reads the same when opened from disk or attached to a ticket.
// Usage: node scripts/standalone.mjs [buildDir] [outDir]   (defaults: build rendered)
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';

const [buildDir = 'build', outDir = 'rendered'] = process.argv.slice(2);
const root = resolve(buildDir);

function htmlFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return name === '_app' ? [] : htmlFiles(p);
    return name.endsWith('.html') ? [p] : [];
  });
}

function cssPath(page, href) {
  const clean = href.split(/[?#]/)[0];
  return clean.startsWith('/') ? join(root, clean) : resolve(dirname(page), clean);
}

const pages = htmlFiles(root);
if (!pages.length) {
  console.error(`No .html files in ${buildDir}. Run "npm run build" first.`);
  process.exit(1);
}
for (const page of pages) {
  let html = readFileSync(page, 'utf8');
  html = html.replace(/<link\b[^>]*rel="stylesheet"[^>]*>/g, (tag) => {
    const href = tag.match(/href="([^"]+)"/)?.[1];
    return href ? `<style>${readFileSync(cssPath(page, href), 'utf8')}</style>` : '';
  });
  html = html
    .replace(/<link\b[^>]*rel="modulepreload"[^>]*>/g, '')
    .replace(/<script\b[\s\S]*?<\/script>/g, '');
  const out = join(resolve(outDir), relative(root, page));
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html);
  console.log(`${relative(process.cwd(), out)}`);
}
