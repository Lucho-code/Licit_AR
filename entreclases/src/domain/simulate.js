// Cohorte SIMULADA para entender el panel antes del piloto (solo en modo demo).
// No son datos reales: cada alumno simulado queda marcado como tal.
import { addDays, weekdayOf } from './dates.js';
import { mulberry32 } from './quiz.js';

const PROFILES = [
  { name: 'constante', share: 0.35, pDay: 0.88, stopAfter: null },
  { name: 'irregular', share: 0.25, pDay: 0.5, stopAfter: null },
  { name: 'abandona', share: 0.2, pDay: 0.9, stopAfter: 3 },
  { name: 'antes-de-clase', share: 0.2, pDay: 0, stopAfter: null },
];

export function simulateCohort({ n = 40, startKey, todayKey, classWeekday = 3, windowDays = 10, lessonsCount = 10, itemIds = [], seed = 42 }) {
  const rng = mulberry32(seed);
  const participants = [];
  const events = [];
  const dayBeforeClass = (Number(classWeekday ?? 3) + 6) % 7;
  let idx = 0;
  for (const profile of PROFILES) {
    const count = Math.round(n * profile.share);
    for (let k = 0; k < count && idx < n; k++, idx++) {
      const uid = `sim_${idx + 1}`;
      const joinedDate = addDays(startKey, Math.floor(rng() * 3));
      participants.push({ uid, alias: `Simulado ${idx + 1}`, joinedDate, joinedAt: Date.parse(`${joinedDate}T12:00:00Z`), simulated: true });
      let lesson = 0;
      for (let d = 0; d < windowDays; d++) {
        const date = addDays(joinedDate, d);
        if (date > todayKey) break;
        let active;
        if (profile.name === 'antes-de-clase') active = d === 0 || weekdayOf(date) === dayBeforeClass;
        else if (profile.stopAfter !== null && d >= profile.stopAfter) active = false;
        else active = d === 0 || rng() < profile.pDay;
        if (!active) continue;
        const hour = profile.name === 'antes-de-clase' ? 22 : 18 + Math.floor(rng() * 4);
        const base = Date.parse(`${date}T${String(hour).padStart(2, '0')}:00:00Z`);
        let t = base;
        const push = (e) => events.push({ uid, d: date, at: (t += 20000 + Math.floor(rng() * 40000)), ...e });
        if (lesson < lessonsCount) {
          lesson += 1;
          for (let i = 0; i < 7; i++) push({ t: 'learn', i: itemIds[(lesson * 7 + i) % Math.max(1, itemIds.length)] || null, l: lesson });
          for (let i = 0; i < 7; i++) push({ t: 'answer', ok: rng() < 0.82, l: lesson, q: 'video-to-text' });
          push({ t: 'lesson_done', l: lesson });
        } else {
          for (let i = 0; i < 6; i++) push({ t: 'answer', ok: rng() < 0.88, q: 'video-to-text' });
          push({ t: 'review_done' });
        }
      }
    }
  }
  return { participants, events };
}
