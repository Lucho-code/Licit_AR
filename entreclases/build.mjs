// Build de Entreclases.
//   node build.mjs            → dist/ (app web instalable, lista para publicar)
//   node build.mjs --serve    → dist/ + servidor local con recompilación en http://localhost:5173
//   node build.mjs --preview  → dist-preview/entreclases.html (vista previa de un solo archivo, modo demo)
import * as esbuild from 'esbuild';
import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const args = new Set(process.argv.slice(2));
const SERVE = args.has('--serve');
const PREVIEW = args.has('--preview');
const BUILD_ID = Date.now().toString(36);

const FONTS_HREF =
  'https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400&family=Schibsted+Grotesk:wght@500;700;800&display=swap';

async function listFiles(dir, base = dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await listFiles(full, base)));
    else out.push(path.relative(base, full).split(path.sep).join('/'));
  }
  return out;
}

function pwaOptions(outdir, dev) {
  return {
    entryPoints: { app: path.join(root, 'src/main.js') },
    bundle: true,
    format: 'esm',
    splitting: true,
    outdir,
    entryNames: '[name]',
    chunkNames: 'chunks/[name]-[hash]',
    minify: !dev,
    charset: 'ascii',
    sourcemap: true,
    target: ['es2020', 'chrome80', 'safari15'],
    define: {
      __PREVIEW__: 'false',
      __DEV__: String(dev),
      __BUILD_ID__: JSON.stringify(BUILD_ID),
    },
    logLevel: 'info',
  };
}

async function finishPwa(outdir) {
  // La app (index, js, css, config, íconos) queda precargada para funcionar sin conexión.
  // Los videos y el módulo de Firebase se guardan en caché la primera vez que se usan.
  const files = await listFiles(outdir);
  const precache = [
    './',
    'index.html',
    `app.js?v=${BUILD_ID}`,
    `app.css?v=${BUILD_ID}`,
    'config.js',
    'manifest.webmanifest',
    ...files.filter((f) => f.startsWith('icons/')),
  ];
  const sw = (await readFile(path.join(outdir, 'sw.js'), 'utf8'))
    .replace('__BUILD_ID__', BUILD_ID)
    .replace('__PRECACHE__', JSON.stringify(precache));
  await writeFile(path.join(outdir, 'sw.js'), sw);
  const html = (await readFile(path.join(outdir, 'index.html'), 'utf8'))
    .replaceAll('__BUILD_ID__', BUILD_ID)
    .replace('__FONTS_HREF__', FONTS_HREF);
  await writeFile(path.join(outdir, 'index.html'), html);
}

async function buildPwa() {
  const outdir = path.join(root, 'dist');
  await rm(outdir, { recursive: true, force: true });
  await cp(path.join(root, 'public'), outdir, { recursive: true });
  await esbuild.build(pwaOptions(outdir, false));
  await finishPwa(outdir);
  console.log(`\nListo: dist/ (build ${BUILD_ID})`);
}

async function serve() {
  const outdir = path.join(root, 'dist');
  await rm(outdir, { recursive: true, force: true });
  await cp(path.join(root, 'public'), outdir, { recursive: true });
  const ctx = await esbuild.context(pwaOptions(outdir, true));
  await ctx.rebuild();
  await finishPwa(outdir);
  await ctx.watch();
  const { port } = await ctx.serve({ servedir: outdir, port: 5173, host: '127.0.0.1' });
  console.log(`\nEntreclases en http://localhost:${port}  (Ctrl+C para cortar)`);
}

// Vista previa de un solo archivo: sin Firebase, sin service worker, videos de muestra embebidos.
const stubFirebase = {
  name: 'preview-stubs',
  setup(build) {
    build.onResolve({ filter: /firebase-store\.js$/ }, () => ({
      path: path.join(root, 'src/data/firebase-store.stub.js'),
    }));
    build.onResolve({ filter: /\/download\.js$/ }, () => ({
      path: path.join(root, 'src/ui/download.preview.js'),
    }));
  },
};

async function buildPreview() {
  const outdir = path.join(root, 'dist-preview');
  await rm(outdir, { recursive: true, force: true });
  await mkdir(outdir, { recursive: true });
  const result = await esbuild.build({
    entryPoints: { app: path.join(root, 'src/main.js') },
    bundle: true,
    format: 'iife',
    outdir,
    write: false,
    minify: true,
    charset: 'ascii',
    target: ['es2020'],
    define: { __PREVIEW__: 'true', __DEV__: 'false', __BUILD_ID__: JSON.stringify(BUILD_ID) },
    plugins: [stubFirebase],
    logLevel: 'info',
  });
  const js = result.outputFiles.find((f) => f.path.endsWith('.js')).text;
  const css = result.outputFiles.find((f) => f.path.endsWith('.css')).text;

  const demoDir = path.join(root, 'public/demo');
  const videos = {};
  for (const name of (await readdir(demoDir)).filter((f) => /\.(mp4|webm)$/.test(f))) {
    const data = await readFile(path.join(demoDir, name));
    const type = name.endsWith('.webm') ? 'video/webm' : 'video/mp4';
    videos[name] = `data:${type};base64,${data.toString('base64')}`;
  }
  const safe = (s) => s.replaceAll('</script', '<\\/script');
  const page = [
    '<title>Entreclases</title>',
    '<link rel="preconnect" href="https://fonts.googleapis.com">',
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
    `<link rel="stylesheet" href="${FONTS_HREF}">`,
    `<style>${css}</style>`,
    '<div id="app"></div>',
    `<script>window.ENTRECLASES_CONFIG={firebase:null};window.__ENTRECLASES_DEMO_VIDEOS__=${safe(JSON.stringify(videos))};</script>`,
    `<script>${safe(js)}</script>`,
  ].join('\n');
  await writeFile(path.join(outdir, 'entreclases.html'), page);
  console.log(`\nListo: dist-preview/entreclases.html (${(page.length / 1024).toFixed(0)} KB)`);
}

if (PREVIEW) await buildPreview();
else if (SERVE) await serve();
else await buildPwa();
