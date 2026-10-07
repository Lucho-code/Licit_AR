// Borrador del plan del piloto: 10 lecciones de 5 señas + 2 frases.
// Son CONCEPTOS en español para que el/la docente sordo/a los revise, cambie o reemplace
// según el programa de su curso. La app no trae señas: cada video lo graba el/la docente.

export const DRAFT_PLAN = [
  { n: 1, title: 'Saludos', signs: ['hola', 'chau', 'gracias', 'por favor', 'perdón'], phrases: ['¿Cómo estás?', 'Bien, ¿y vos?'] },
  { n: 2, title: 'Presentarse', signs: ['nombre', 'yo', 'vos', 'sordo / sorda', 'oyente'], phrases: ['¿Cómo te llamás?', '¿Sos sordo u oyente?'] },
  { n: 3, title: 'Preguntas', signs: ['qué', 'quién', 'dónde', 'cuándo', 'por qué'], phrases: ['¿Dónde vivís?', '¿Qué hacés?'] },
  { n: 4, title: 'Familia', signs: ['mamá', 'papá', 'hermano / hermana', 'hijo / hija', 'familia'], phrases: ['¿Tenés hermanos?', 'Mi familia es grande'] },
  { n: 5, title: 'Tiempo', signs: ['hoy', 'mañana', 'ayer', 'semana', 'día'], phrases: ['¿Qué día es hoy?', 'Nos vemos mañana'] },
  { n: 6, title: 'Cómo estoy', signs: ['contento / contenta', 'triste', 'cansado / cansada', 'enojado / enojada', 'bien'], phrases: ['Estoy cansado', '¿Qué te pasa?'] },
  { n: 7, title: 'Lugares', signs: ['casa', 'escuela', 'trabajo', 'baño', 'hospital'], phrases: ['¿Dónde está el baño?', 'Voy al trabajo'] },
  { n: 8, title: 'Acciones', signs: ['comer', 'tomar (beber)', 'dormir', 'trabajar', 'estudiar'], phrases: ['¿Comiste?', 'Tengo que estudiar'] },
  { n: 9, title: 'Comunicarse', signs: ['entender', 'repetir', 'despacio', 'aprender', 'lengua de señas'], phrases: ['No entiendo, ¿podés repetir?', 'Estoy aprendiendo lengua de señas'] },
  { n: 10, title: 'Ayudar', signs: ['sí', 'no', 'querer', 'poder', 'ayudar'], phrases: ['¿Necesitás ayuda?', 'Quiero aprender más'] },
];

/** Ítems del plan listos para guardar como contenido "pendiente de grabación". */
export function draftItems() {
  const items = [];
  for (const lesson of DRAFT_PLAN) {
    lesson.signs.forEach((meaning, i) => {
      items.push({ kind: 'sign', meanings: [meaning], lesson: lesson.n, order: i + 1 });
    });
    lesson.phrases.forEach((meaning, i) => {
      items.push({ kind: 'phrase', meanings: [meaning], lesson: lesson.n, order: lesson.signs.length + i + 1 });
    });
  }
  return items;
}

export function draftLessonTitles(count = DRAFT_PLAN.length) {
  return Array.from({ length: count }, (_, i) => ({ n: i + 1, title: DRAFT_PLAN[i]?.title || '' }));
}
