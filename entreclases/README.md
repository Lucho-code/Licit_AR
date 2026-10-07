# Entreclases

App web para practicar **Lengua de Señas Argentina (LSA) entre una clase y la otra**. Es la primera versión, pensada para el piloto de 2 semanas con un grupo de alumnos de un curso de LSA.

> **La app no trae señas.** Cada video lo graba (o lo sube) el/la docente sordo/a desde la propia app. El "Curso de muestra" usa trazos abstractos, marcados como *"No es una seña de LSA"*, y sirve solo para probar el funcionamiento.

---

## Qué hace

**Alumno o alumna**
- Entra con el **código del curso**. No necesita cuenta: solo un apodo.
- **Lección diaria corta** con tres partes:
  1. Aprender: video en loop, cámara lenta (0,25× a 1×), espejo y cambio de toma.
  2. Reconocer: ejercicios de "¿qué significa?" y "¿cuál es la seña?".
  3. Repasar lo que vence ese día.
- **Espejo**: el video arriba y la cámara frontal abajo. No graba ni envía nada.
- **Repaso espaciado**: lo que sale mal vuelve al día siguiente y lo que sale bien vuelve en unos días.
- Se habilita **una lección nueva por día**. El repaso está siempre disponible.
- **Mis señas**: buscador de lo que ya aprendió.

**Estudio docente**
- Crear el curso, con la opción de cargar el **plan borrador** de 10 lecciones (5 señas y 2 frases cada una) para revisarlo con el/la docente sordo/a.
- **Grabar con la cámara**, con guía de encuadre (cabeza a cadera) y cuenta regresiva. También se puede **subir un video**.
- Registrar a cada **señante con su consentimiento**. Sin consentimiento cargado, la app no deja grabar con esa persona.
- **Validar** cada seña y **publicar por versiones**. Por defecto se publica solo lo validado.
- Sumar al **equipo** (docentes, intérpretes, coordinación) con su cuenta de Google.

**Panel del piloto**
- Veredicto automático contra los criterios acordados de antemano. Por defecto:
  - Confirma si al menos el 50 % practica 7 de 10 días.
  - Refuta si menos del 25 % llega a la lección 5.
  - Alerta si la práctica se concentra el día antes de la clase.
- Muestra días con práctica por alumno, práctica por día de la cohorte, aciertos y minutos.
- Exporta a **CSV para Excel** (separador `;`).
- En el modo demo hay una **cohorte simulada** de 40 alumnos para ver cómo se lee el panel. Esos alumnos quedan marcados como simulados.

---

## Dos modos

| | Modo demo | Modo piloto |
|---|---|---|
| Para qué | Probar la app y mostrársela a un/a docente | Correr el piloto con alumnos reales |
| Dónde quedan los datos | Solo en ese navegador | En Firebase (Google), compartidos |
| Cuentas | No hace falta | Docentes: Google. Alumnos: sin cuenta |
| Cómo se activa | Dejando `firebase: null` en `public/config.js` | Pegando la configuración de Firebase en `public/config.js` |

Agregando `?demo` a la dirección se fuerza el modo demo aunque haya Firebase configurado.

---

## Probarla en el celular

Abrí este enlace en el teléfono, con Chrome en Android o Safari en iPhone:

**https://raw.githack.com/Lucho-code/Licit_AR/ccr-f0652fc3-illpha/entreclases/movil/index.html**

- Es la app completa en **modo demo**: lo que hagas queda guardado solo en ese teléfono.
- La cámara funciona (espejo y grabación). Cuando el teléfono pida permiso, aceptalo.
- Para instalarla:
  - Android: menú ⋮ → **Agregar a la pantalla principal**.
  - iPhone: botón Compartir → **Agregar a inicio**.
- Una vez abierta, funciona sin conexión.

La carpeta `movil/` es una copia compilada que publica GitHub a través de raw.githack.com. Se regenera con `npm run build:movil` y se prueba con `npm run test:movil` (emula un Pixel 7). Si el PR se une a `main`, el enlace pasa a usar `main` en lugar del nombre de la rama.

---

## Probarla en la computadora

Requisitos: [Node.js](https://nodejs.org) 20 o más reciente.

```bash
cd entreclases
npm install
npm run build
npm run serve        # abre http://localhost:4173
```

Para usar la cámara desde el celular, la app tiene que estar publicada con `https` (paso 6 de la sección siguiente).

---

## Poner en marcha el piloto real (Firebase)

1. **Crear un proyecto nuevo** en <https://console.firebase.google.com>. Usá uno propio de Entreclases, no el de Licit_AR, para que las reglas de seguridad no se pisen.
2. **Authentication → Sign-in method**: habilitá **Google** y **Anónimo**.
3. **Firestore Database → Crear base de datos**, en modo producción y en una región de Sudamérica (por ejemplo `southamerica-east1`).
4. **Storage → Comenzar**, en la misma región.
   - Pide pasar al plan **Blaze** (pago por uso, con tarjeta).
   - Para un piloto de unos 50 alumnos con videos cortos, el costo esperado es de centavos de dólar.
   - Configurá una **alerta de presupuesto** de USD 5 en Google Cloud para dormir tranquilo.
5. **Configuración del proyecto → Tus apps → Web**: registrá la app, copiá el bloque `firebaseConfig` y pegalo en `public/config.js`, en lugar de `firebase: null`.
6. **Publicar la app, las reglas y los índices:**
   ```bash
   cp .firebaserc.example .firebaserc   # y poné el ID de tu proyecto
   npx firebase login
   npm run deploy
   ```
   - La primera vez, la consola pregunta si autoriza a Storage a consultar Firestore. Respondé que **sí**: las reglas de los videos lo necesitan para saber quién es docente.
   - La app queda en `https://TU-PROYECTO.web.app`.
7. **Primera prueba:**
   1. Entrá a `/#/estudio` con tu cuenta de Google y creá el curso.
   2. En **Equipo**, sumá al/la docente sordo/a.
   3. Registrá a la persona señante con su consentimiento, grabá dos o tres señas, validalas y publicá.
   4. Con otro teléfono, entrá con el código como si fueras alumno.

---

## Día de grabación: reglas que después no se pueden cambiar

Volver a grabar es lo más caro del proyecto, así que conviene definir esto antes:

- **Cuadros por segundo:** idealmente 50 o más, para que la cámara lenta se vea fluida. La app muestra los cuadros por segundo de la cámara y avisa si son pocos.
- **Luz:** de frente, sin sombras en la cara, porque los rasgos no manuales son gramática. Usá LED sin parpadeo: la red eléctrica en Argentina es de 50 Hz.
- **Fondo:** liso y mate, gris o azul. Ropa lisa y oscura, sin accesorios.
- **Encuadre:** de la cabeza a la cadera, con todo el espacio de señado. La guía de la app lo marca.
- **Cada toma:** empieza y termina con las manos en reposo. Si se puede, grabá con **2 señantes** en el vocabulario principal.
- **Rendimiento:** medí cuántas señas salen por jornada en la primera sesión. Ese dato define el costo y el plazo de todo el contenido.

**Desde un iPhone:** si subís videos grabados con la cámara del teléfono, configurá la cámara en "Más compatible" (H.264). Otra opción es usar "Grabar con la cámara" dentro de la app.

---

## Consentimiento y privacidad

- **Señantes.** La app registra qué autoriza cada persona: uso en la app, territorios, plazo, uso para entrenar IA, obras derivadas, baja y fecha de firma. **No reemplaza el documento firmado**. Hacé revisar el modelo de cesión de imagen con un/a abogado/a (art. 53 del Código Civil y Comercial y Ley 25.326).
- **Alumnos.**
  - Solo se guarda un apodo, el avance y las respuestas.
  - **No se pregunta la condición auditiva**, que es un dato de salud y por lo tanto sensible.
  - **La cámara no graba**: el espejo funciona solo en el teléfono.
- **Quién ve qué** (`firebase/firestore.rules`):
  - Alumnos: ven lo publicado y escriben solo su avance.
  - Equipo docente: ve el contenido, el panel y los videos sin publicar.
  - Nadie puede listar cursos ni códigos.
  - Las reglas están probadas con los emuladores de Firebase.

---

## Límites conocidos de esta versión

- En el modo piloto los videos necesitan conexión. Lo demás funciona sin conexión: la app y el avance se guardan y se envían al volver la conexión. Para guardar videos en el teléfono hay que configurar CORS en el bucket de Storage (queda para la versión 1).
- El repaso espaciado es simple (cajas tipo Leitner). El registro de eventos permite cambiar después a FSRS sin perder historia.
- No hay reconocimiento de señas con IA, a propósito: primero hay que validar el hábito y juntar datos con consentimiento.
- Si un alumno borra los datos del navegador, pierde su avance en ese teléfono. Vuelve a entrar con el código y figura como alumno nuevo.
- Solo LSA. El modelo de datos ya contempla variantes regionales y otras lenguas de señas.

---

## Para quien programe

```
entreclases/
├─ public/                 index, manifest, service worker, config.js, íconos, videos de muestra
├─ src/
│  ├─ domain/              lógica pura con pruebas: fechas, repaso, lecciones, ejercicios, métricas, CSV, plan borrador
│  ├─ data/                LocalStore (demo, IndexedDB) y FirebaseStore (piloto) con la misma interfaz
│  ├─ media/               cámara, grabación (MediaRecorder) y lectura de videos
│  └─ ui/                  pantallas (Preact + htm, sin paso de JSX)
├─ firebase/               reglas de Firestore y Storage, índices
├─ test/unit · test/rules · test/e2e
└─ build.mjs               esbuild: dist/ (app) y dist-preview/ (vista previa de un solo archivo)
```

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo con recompilación |
| `npm run build` | Genera `dist/` para publicar |
| `npm run build:preview` | Genera la vista previa de un solo archivo (modo demo) |
| `npm run build:movil` / `npm run test:movil` | Genera y prueba la versión para el celular (carpeta `movil/`) |
| `npm test` | Pruebas de la lógica |
| `npm run test:e2e` | Recorridos completos en Chromium con cámara simulada (modo demo) |
| `npm run test:firebase` | Reglas de seguridad y recorrido completo contra los emuladores de Firebase (requiere Java 11 o más reciente) |
| `npm run emulators` | Emuladores de Firebase para desarrollar sin tocar datos reales |
| `npm run deploy` | Build y publicación en Firebase (hosting, reglas, índices) |
| `npm run demo-videos` / `npm run icons` | Regeneran los videos de muestra (requiere ffmpeg) y los íconos |

**Decisiones de diseño:**
- **El contenido se publica como un paquete por versión.** Los alumnos leen la foto publicada, no el borrador; así se puede corregir sin romper la práctica de nadie.
- **Cada seña tiene un identificador fijo**, con significados, variante regional y parámetros lingüísticos opcionales. No se identifica por "la palabra en español".
- **Cada respuesta se guarda como evento**, en tandas para escribir menos. Con eso se mide el piloto y se puede recalcular el repaso.
- **La cámara se procesa siempre en el dispositivo.**
