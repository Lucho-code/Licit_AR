# CLAUDE.md — Licit_AR (Calculadora Vial Multiescenario)

Guía para agentes de código que trabajan en este repositorio. Adaptada de las ideas de
[affaan-m/ECC](https://github.com/affaan-m/ECC) (reglas comunes + TypeScript + ciclo
planificar → implementar → verificar), recortada a lo que este proyecto necesita.

## Qué es

Simulador del coeficiente polinómico **K** para ofertas de licitaciones de obra pública
vial en Santa Fe, Argentina. Tres escenarios simultáneos (mínimo / óptimo / máximo),
extracción de parámetros desde pliegos con Gemini, comparador de ofertas de proveedores
y exportación a CSV/JSON/Excel/Google Drive/Sheets. Idioma de la UI y del dominio: español.

## Comandos

| Tarea | Comando |
|---|---|
| Instalar | `npm install` |
| Desarrollo (Express + Vite en :3000) | `npm run dev` |
| Chequeo de tipos (único "lint" disponible) | `npm run lint` |
| Build de producción | `npm run build` |

No hay suite de tests todavía. `npm run lint` debe pasar antes de cada commit.

## Arquitectura

- `server.ts` — Express. Endpoints `/api/analyze-pliego` y `/api/analyze-offers` llaman a
  Gemini con `GEMINI_API_KEY` (solo en servidor). En dev monta Vite como middleware.
- `src/utils.ts` — **motor de cálculo** (`calcEscenario`, `DEFAULT_INPUTS`, `PRESETS`,
  `FILAS_ESTRUCTURA`). Es la parte crítica del producto.
- `src/types.ts` — `InputsState`, `ScenarioResult`, `RowMeta`.
- `src/App.tsx` — estado principal y la mayoría de la UI (archivo grande, ~2800 líneas).
- `src/components/*Tab.tsx` — pestañas (tabla, gráficos, fórmulas, riesgos, Gantt, ofertas).
- `src/AuthContext.tsx`, `src/firebase.ts` — Firebase Auth (Google) + Firestore;
  el access token OAuth se usa para Drive/Sheets desde el cliente.
- `firestore.rules` + `security_spec.md` — reglas y casos de ataque esperados.

## Motor de cálculo: invariantes

Cualquier cambio en `calcEscenario` o en `FILAS_ESTRUCTURA` es un cambio de **modelo
económico**, no un refactor. Antes de tocarlo:

1. Mantener sincronizadas las tres representaciones de cada fórmula: `src/utils.ts`,
   la pestaña de fórmulas (`FormulasTab.tsx`) y la sección "Estructura y Matemática" del
   `README.md`. Si cambia una, cambian las tres.
2. Alícuotas fijas actuales: IIBB 3,5 % (Santa Fe), impuesto al cheque 0,6 %, IVA 21 %.
   No cambiarlas sin pedido explícito; si cambian, actualizar etiquetas de filas.
3. Los porcentajes en `InputsState` se guardan como número entero/decimal de porcentaje
   (`20.0` = 20 %), nunca como fracción.
4. `k = pv_total / cd`. Verificar a mano con `DEFAULT_INPUTS` que el K del escenario
   óptimo no cambie salvo que el cambio lo busque, y reportar el valor antes/después.
5. La función debe seguir siendo pura (sin estado, sin efectos), para poder testearla.

## Convenciones TypeScript / React

- Evitar `any` en código nuevo. En respuestas de Gemini, `fetch` y Firestore, tipar la
  forma esperada y validar en el borde (números finitos, campos requeridos) antes de
  pasar datos al estado. El `any` existente en `server.ts` es deuda, no patrón a copiar.
- Inmutabilidad por defecto: actualizar estado con spreads/copias, no mutar objetos.
- Funciones de cálculo y formateo en `src/utils.ts` (puras); componentes solo presentan.
- No seguir agrandando `App.tsx`: lógica nueva va en un componente o módulo propio.
- Formato de moneda con `fmtLocal` (locale `es-AR`); factores con `fmtFactor` (4 decimales).
- Mantener el estilo existente: Tailwind v4, `lucide-react`, `motion/react`, Recharts.
- Textos de UI y mensajes de error al usuario en español.

## Seguridad

- **Secretos**: `GEMINI_API_KEY` solo en `process.env` del servidor; nunca en `src/`,
  nunca en commits. `.env*` está en `.gitignore` (salvo `.env.example` con placeholders).
- **Firestore**: todo documento lleva `userId == request.auth.uid`. Al agregar una
  colección o campo: actualizar `firestore.rules` (deny-by-default) y agregar los casos de
  ataque correspondientes en `security_spec.md`.
- **Tokens OAuth de Google**: viven solo en memoria (`AuthContext`); no persistirlos en
  `localStorage` ni loguearlos. No ampliar scopes sin necesidad.
- **Entrada de IA**: lo que devuelve Gemini es dato no confiable; validar rangos antes de
  cargarlo en `InputsState`.
- **Errores**: no devolver `error.message` interno ni stack al cliente en código nuevo.

Deuda de seguridad conocida (no corregir sin pedido, pero no empeorarla):
- Los endpoints `/api/analyze-*` no exigen autenticación ni rate limit, con body de hasta
  50 MB → cualquiera puede consumir la cuota de Gemini.
- El login pide scope `drive` completo; `drive.file` alcanzaría para exportar.
- Las respuestas de error del servidor concatenan `error.message`.

## Flujo de trabajo del agente

1. **Entender**: leer los archivos afectados antes de proponer cambios.
2. **Planificar** si el cambio toca más de un archivo o el motor de cálculo.
3. **Implementar** el cambio mínimo que resuelve el pedido; no refactorizar de paso.
4. **Verificar**: `npm run lint`; si se tocó el cálculo, comparar K antes/después con
   `DEFAULT_INPUTS`; si se tocó UI, levantar `npm run dev` y revisar la pestaña afectada.
5. **Revisar el propio diff** buscando secretos, `any` nuevos, `console.log` sobrantes y
   reglas de Firestore sin actualizar.

## Git

- Commits en formato convencional, como el historial existente:
  `feat:`, `fix:`, `refactor:`, `docs:`, `chore:` + descripción breve.
- Un cambio lógico por commit. No commitear `dist/`, `node_modules/` ni `.env`.
