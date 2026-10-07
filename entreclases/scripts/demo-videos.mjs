// Genera los videos del curso de muestra: un punto que dibuja un trazo abstracto.
// NO son señas. Sirven solo para probar el reproductor, el espejo y los ejercicios
// antes de que el/la docente grabe el contenido real.
//   node scripts/demo-videos.mjs   (requiere ffmpeg con libx264)
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'public/demo');
mkdirSync(out, { recursive: true });

const FONT = '/usr/share/fonts/opentype/inter/Inter-SemiBold.otf';
const CX = '(main_w/2-overlay_w/2)';
const CY = '(main_h/2-overlay_h/2+12)';

// Trayectorias con período de 3 s que empiezan y terminan en el centro (loop limpio).
const paths = {
  circulo: (th) => [`${CX}+70*sin(${th})`, `${CY}-70+70*cos(${th})`],
  ocho: (th) => [`${CX}+120*sin(${th})`, `${CY}+72*sin(2*${th})`],
  zigzag: (th) => [`${CX}+120*sin(${th})`, `${CY}+60*asin(sin(4*${th}))*2/PI`],
  vaiven: (th) => [`${CX}+140*sin(${th})`, `${CY}`],
  'arriba-abajo': (th) => [`${CX}`, `${CY}-110*sin(${th})`],
  diagonal: (th) => [`${CX}+120*sin(${th})`, `${CY}-96*sin(${th})`],
};

const single = (name) => ({ name, seconds: 3, xy: paths[name]('(2*PI*t/3)') });
const pair = (name, a, b) => {
  const [ax, ay] = paths[a]('(2*PI*t/3)');
  const [bx, by] = paths[b]('(2*PI*(t-3)/3)');
  return { name, seconds: 6, xy: [`if(lt(t,3),${ax},${bx})`, `if(lt(t,3),${ay},${by})`] };
};

const clips = [
  single('circulo'),
  single('ocho'),
  single('zigzag'),
  single('vaiven'),
  single('arriba-abajo'),
  single('diagonal'),
  pair('frase-circulo-vaiven', 'circulo', 'vaiven'),
  pair('frase-ocho-diagonal', 'ocho', 'diagonal'),
];

for (const clip of clips) {
  const [x, y] = clip.xy;
  const d = clip.seconds;
  const graph = [
    `color=c=0x1e2330:s=480x360:r=50:d=${d}[bg]`,
    `color=c=white:s=28x28:r=50:d=${d},format=rgba,geq=r=255:g=255:b=255:a='255*lte(hypot(X-13.5,Y-13.5),13)'[dot]`,
    `[bg][dot]overlay=x='${x}':y='${y}':eval=frame,format=gbrp,lagfun=decay=0.93,format=yuv420p,` +
      `drawtext=fontfile=${FONT}:text='VIDEO DE MUESTRA':x=16:y=14:fontsize=15:fontcolor=white@0.7,` +
      `drawtext=fontfile=${FONT}:text='No es una seña de LSA':x=(w-text_w)/2:y=h-32:fontsize=17:fontcolor=white@0.85[v]`,
  ].join(';');
  // MP4 (H.264) para la mayoría de los teléfonos y WebM (VP9) para navegadores sin H.264.
  const mp4 = path.join(out, `${clip.name}.mp4`);
  execFileSync(
    'ffmpeg',
    ['-y', '-loglevel', 'error', '-filter_complex', graph, '-map', '[v]', '-t', String(d), '-c:v', 'libx264',
      '-preset', 'slow', '-crf', '30', '-profile:v', 'main', '-pix_fmt', 'yuv420p', '-g', '50',
      '-movflags', '+faststart', '-an', mp4],
    { stdio: 'inherit' },
  );
  const webm = path.join(out, `${clip.name}.webm`);
  execFileSync(
    'ffmpeg',
    ['-y', '-loglevel', 'error', '-filter_complex', graph, '-map', '[v]', '-t', String(d), '-c:v', 'libvpx-vp9',
      '-crf', '42', '-b:v', '0', '-row-mt', '1', '-g', '50', '-pix_fmt', 'yuv420p', '-an', webm],
    { stdio: 'inherit' },
  );
  console.log('ok', path.relative(root, mp4), path.relative(root, webm));
}
