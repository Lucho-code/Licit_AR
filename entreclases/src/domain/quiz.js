// Ejercicios autocorregibles, sin IA:
//   video-to-text: se ve la seña o frase y se elige el significado.
//   text-to-video: se lee el significado y se elige el video correcto.

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function rng() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle(list, rng = Math.random) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function primaryMeaning(item) {
  return (item.meanings && item.meanings.find((m) => m && m.trim())) || item.gloss || '—';
}

const norm = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[¿?¡!.,]/g, '')
    .trim();

function uniqueByMeaning(items, exclude) {
  const seen = new Set([norm(exclude)]);
  const out = [];
  for (const it of items) {
    const key = norm(primaryMeaning(it));
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(it);
  }
  return out;
}

/**
 * Arma una pregunta o devuelve null si no hay con qué armar opciones.
 * `pool` son las señas que el alumno ya conoce o está aprendiendo (sirven de distractores).
 */
export function makeQuestion(type, target, pool, rng = Math.random, opts = {}) {
  const textOptions = opts.textOptions ?? 4;
  const videoOptions = opts.videoOptions ?? 3;
  const wanted = (type === 'text-to-video' ? videoOptions : textOptions) - 1;
  const others = pool.filter((p) => p.id !== target.id && p.media && p.media.length > 0);
  const sameKind = shuffle(others.filter((p) => p.kind === target.kind), rng);
  let candidates = uniqueByMeaning(sameKind, primaryMeaning(target));
  if (candidates.length < wanted && type === 'video-to-text') {
    const otherKind = shuffle(others.filter((p) => p.kind !== target.kind), rng);
    candidates = uniqueByMeaning([...candidates, ...otherKind], primaryMeaning(target));
  }
  const distractors = candidates.slice(0, wanted);
  if (distractors.length === 0) return null;
  const options = shuffle([target, ...distractors], rng).map((it) => ({ id: it.id, label: primaryMeaning(it) }));
  return { key: `${type}:${target.id}`, type, itemId: target.id, kind: target.kind, options, answerId: target.id };
}

/** Preguntas para fijar lo aprendido hoy: alterna los dos sentidos en las señas. */
export function recognizeQuestions(items, pool, rng = Math.random) {
  const qs = [];
  let signIndex = 0;
  for (const item of items) {
    let type = 'video-to-text';
    if (item.kind === 'sign') {
      type = signIndex % 2 === 0 ? 'video-to-text' : 'text-to-video';
      signIndex += 1;
    }
    const q = makeQuestion(type, item, pool, rng) || (type === 'text-to-video' ? makeQuestion('video-to-text', item, pool, rng) : null);
    if (q) qs.push(q);
  }
  return shuffle(qs, rng);
}

/** Preguntas de repaso para las señas que vencen hoy. */
export function reviewQuestions(items, pool, rng = Math.random, max = 12) {
  const qs = [];
  for (const item of items.slice(0, max)) {
    const type = item.kind === 'sign' && rng() < 0.5 ? 'text-to-video' : 'video-to-text';
    const q = makeQuestion(type, item, pool, rng) || makeQuestion('video-to-text', item, pool, rng);
    if (q) qs.push(q);
  }
  return qs;
}

export function isCorrect(question, optionId) {
  return question.answerId === optionId;
}
