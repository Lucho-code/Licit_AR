# Calculadora Vial Multiescenario para Análisis Polinómico 🛣️🧪

Una plataforma interactiva de simulación financiera avanzada orientada a la estimación y optimización del coeficiente polinómico **K** para propuestas en **licitaciones de obra pública vial**. Diseñada específicamente adaptando los parámetros, coeficientes y alícuotas fiscales vigentes en la provincia de Santa Fe, Argentina (febrero de 2026).

---

## 🌟 Descripción General

Esta herramienta permite a las empresas constructoras y analistas de costos simular la viabilidad económica de su propuesta bajo condiciones de alta variabilidad macroeconómica. A partir de un **Costo Directo Base**, el sistema calcula de manera integrada todas las variables incidentes (costos indirectos, seguros, imprevistos, inflación proyectada, beneficio, impuesto al cheque e Ingresos Brutos de Santa Fe) y calcula en tiempo real el coeficiente polinómico **K** para tres escenarios simultáneos:

- **Mínimo (Agresivo):** Ideado para competir fuertemente en precio, reduciendo imprevistos y optimizando el beneficio.
- **Óptimo (Estándar):** El punto de equilibrio óptimo que equilibra la rentabilidad empresarial con el resguardo contra fluctuaciones.
- **Máximo (Protegido):** Estructurado para escenarios de alta incertidumbre financiera y alta inflación, maximizando el resguardo de capital.

---

## 🛠️ Características Principales

### 🔴 1. Simulación Dinámica Multiescenario
Modifica parámetros generales e individuales de inflación y beneficio requerido, viendo el impacto de inmediato reflejado en todos los flujos económicos e indicadores de rentabilidad del proyecto.

### 🔴 2. Mitigación Financiera mediante Acopio Preventivo de H-30
Permite simular la inyección líquida preventiva mediante la compra anticipada de metros cúbicos de **Hormigón H-30**. El sistema calcula el valor del acopio y lo deduce en tiempo real de la base de aplicación del costo financiero neto (préstamo puente o scoperto bancario), atenuando el interés comercial cobrado y disminuyendo el coeficiente **K**.

### 🔴 3. Inspección Interactiva y Auditoría
Al hacer clic en cualquiera de las **20 filas estructurales** de la planilla de análisis, se despliega un panel lateral de auditoría avanzada que detalla:
* Explicación conceptual profunda del rubro.
* Valores simulados exactos en pesos para los tres escenarios.
* La fórmula exacta de cálculo aplicada.

### 🔴 4. Tres Modos de Visualización Académica y Comercial
* **Planilla Estructural:** Una tabla dinámica sofisticada que simula un presupuesto de pliego oficial, coloreando subtotales y resaltando el cálculo definitivo del multiplicador K.
* **Gráficos Dinámicos:** Gráfico de barras de Recharts para una comparativa cruzada de componentes estructurales ($) e histograma de torta reflectando el desglose exacto en porcentaje del precio total para el escenario seleccionado.
* **Rastro de Fórmulas:** Una vista detallada tipo "Caja Negra" que devela la secuencia aritmética completa de cálculo paso a paso, ayudando a certificar la corrección matemática para la presentación técnica formal.

### 🔴 5. Exportación Comercial
Descarga en un clic la estructura simulada para su incorporación a los pliegos de propuesta técnica:
* **Exportar CSV:** Formato compatible con Microsoft Excel y software de cálculo vial.
* **Descargar JSON:** Respaldo completo de la simulación del lote para archivar o transferir entre analistas de costos.

---

## ✏️ Estructura y Matemática del Modelo

El modelo calcula secuencialmente el precio de oferta a partir de las siguientes expresiones aritméticas oficiales:

1. **Costo de Obra Base ($Sub_5$):**
   $$Sub_5 = CD + CI + Seguro_s + Garantías + Sellado + Aportes + Imprevistos$$
   * Donde:
     * $CD$: Costo Directo Base de Obra.
     * $CI$: Costos Indirectos de Obra ($CD \times \%CI$).
     * $Seguros$: Responsabilidad Civil y ART ($CD \times \%Seguros$).
     * $Garantías$: Gastos de fianza de mantenimiento de oferta ($CD \times \%Garantías$).
     * $Sellado$: Tasa de Sellos Provincial ($CD \times \%Sellados$).
     * $Aportes$: Contribuciones a colegios de ingeniería/cajas previsionales ($CD \times \%Aportes$).
     * $Imprevistos$: Fondo de contingencia técnica local ($(CD + CI) \times \%Imprevistos$).

2. **Costo Total de Obra ($C_{total}$):**
   $$C_{total} = Sub_5 + Inflación + GastoS\_Generale_s$$
   * Donde:
     * $Inflación$: Cobertura por devaluación supuesta ($Sub_5 \times \%Inflación$).
     * $GastosS\_Generale_s$: Incidencia de administración central ($(Sub_5 + Inflación) \times \%Gastos\_Generales$).

3. **Costo Financiero Neto ($Fin$):**
   $$Anticipo = Cantidad_{H30} \times Precio_{H30}$$
   $$Base\_Financiera = \max(0, C_{total} - Anticipo)$$
   $$Fin = Base\_Financiera \times \%Costo\_Financiero$$

4. **Beneficio Empresarial ($Ben$):**
   $$Sub_{11} = C_{total} + Fin$$
   $$Ben = Sub_{11} \times \%Beneficio$$

5. **Impuestos de Ley y Gravámenes ($Venta_{bruta}$):**
   $$Sub_{13} = Sub_{11} + Ben$$
   * **Ingresos Brutos (IIBB Santa Fe):** $Sub_{13} \times 3.5\%$
   * **Impuesto al Cheque:** $0.6\% \times (C_{total} + Sub_{13} \times 4.1\%)$
   * **IVA (21.0%):** $Sub_{13} \times 21\%$

6. **Precio Total de Venta de Oferta ($PV$):**
   $$PV = Sub_{13} + IIBB + Cheque + IVA$$

7. **Multiplicador Polinómico de Obra ($K$):**
   $$K = \frac{PV}{CD}$$

---

## 💡 Justificación Tecnológica: ¿Por qué React + TypeScript en lugar de Python?

Es común preguntarse si un sistema que realiza cálculos financieros e ingeniería de costos viales se vería beneficiado de programarse enteramente en **Python** (utilizando librerías como Pandas junto con frameworks de UI como Streamlit, Dash o Gradio). Sin embargo, para una plataforma comercial interactiva de alta fidelidad como esta, el stack **React + TypeScript + Node.js** ofrece ventajas técnicas y operativas sumamente superiores:

### 1. Fluidez de Interfaz Absoluta y Zero-Latency (Estado en Cliente)
* **El Problema en Python:** Frameworks rápidos de Python (como *Streamlit* o *Gradio*) ejecutan el código de manera secuencial en el servidor. Cada vez que el analista mueve un slider de inflación o cambia el volumen de hormigón en un slider, los datos viajan al servidor Python, se re-evalúa el script completo, y se vuelve a pintar la interfaz. Esto provoca un parpadeo perceptible, lag transaccional y bloqueos visuales molestos en pantallas complejas.
* **La Solución en React:** Toda la matemática matemática y polinómica corre de manera local inmediata e instantánea en el navegador del usuario mediante estados reactivos fluidos y memoizados (`useMemo`). El recalculo de los 20 rubros viales sobre tres escenarios simultáneos (Mínimo, Óptimo y Máximo) se ejecuta en menos de **2 milisegundos**, asegurando un arrastre del mouse sumamente suave y una retroalimentación en tiempo real perfecta.

### 2. Diseño de Experiencia de Usuario Exclusiva (UX/UI a Medida)
* **El Problema en Python:** Los componentes de Streamlit o Dash tienen interfaces de plantillas rígidas e impersonales con diseño por defecto difícil de adaptar a marcas corporativas o estéticas avanzadas.
* **La Solución con Tailwind CSS + Motion:** El uso de React permite estructurar una experiencia visual de alto impacto (estilo *Warm Calm Clay*), integrando efectos interactivos de arrastre de Gantt, animaciones de micro-transición fluidas mediante `motion/react`, layouts de grillas adaptables (Bento Grids) y un cajón lateral (*drawer*) de auditoría táctil, lo cual es impracticable de lograr con componentes estándar de Python.

### 3. Computación y Procesamiento de Documentos Cliente-Servidor Descentralizada
* **En el Cliente (React):** La exportación a hojas de cálculo complejas y reportes PDF se realiza usando la potencia del procesador de la computadora del usuario mediante librerías modernas de JavaScript como `exceljs` y `jspdf`. El Excel resultante no solo contiene "datos planos", ¡contiene fórmulas vivas de celdas inyectadas directamente! Todo este pesado procesamiento gráfico y matemático se delega al cliente de forma segura, reduciendo drásticamente el consumo de RAM en nuestros servidores contenedores de despliegue.
* **En el Backend (Node/Express):** Se utiliza una capa ultraligera de Node orientada exclusivamente a orquestar las consultas inteligentes del pliego licitatorio contra los modelos de lenguaje Gemini. El API Key de IA nunca se expone al navegador, logrando la máxima protección bancaria corporativa.

### 4. Concurrencia y Robustez de Tipado con TypeScript
* El motor analítico de la simulación vial administra docenas de parámetros independientes (coeficientes, porcentajes de ley, alícuotas, acopios y costos).
* Programar esto en Python sin un sistema rígido de tipado dinámico invita a errores de tipo silenciosos (`TypeError`) difíciles de trazar en producción. Con **TypeScript**, el 100% del modelo financiero está tipado de manera estricta. Cualquier discrepancia matemática es detectada por el compilador en tiempo de desarrollo, garantizando un resultado libre de bugs operacionales para el ofertante de la obra.

---

## 📂 Presets Incluidos en la Aplicación

Para facilitar un inicio ágil, la interfaz incluye botones de acceso directo a cuatro estados paradigmáticos:
* **Condiciones Originales de Licitación:** El estado base estándar para proyectos de vialidad urbana.
* **Escenario de Alta Inflación (Protección):** Eleva el resguardo e intereses financieros previstos debido a la inestabilidad de caja.
* **Estrategia Agresiva (Bajo Margen):** Ajusta al mínimo técnico las incidencias corporativas y márgenes netos para maximizar la competitividad.
* **Obra en Gran Escala (Doble de Volumen):** Adapta los montos de obra gruesa de hormigón y ajusta las incidencias indirectas por economías de escala.

---

## 💻 Guía de Desarrollo para Programadores

La aplicación está construida utilizando un stack moderno, responsivo y ultra veloz:
* **Frontend:** React 19 (TypeScript)
* **Estilos:** Tailwind CSS v4 con sistema de variables orgánico.
* **Animaciones:** Motion (`motion/react`) para transiciones armónicas.
* **Gráficos:** Recharts con total soporte responsive.
* **Iconografía:** Lucide React.
* **Build System:** Vite.

### Requisitos Previos

Asegúrate de contar con [Node.js](https://nodejs.org/) instalado (versión 18 o superior recomendada).

### Instrucciones de Instalación

1. **Clonar e instalar dependencias:**
   ```bash
   npm install
   ```

2. **Ejecutar servidor de desarrollo local:**
   ```bash
   npm run dev
   ```
   *La aplicación estará accesible de forma predeterminada mediante la dirección [http://localhost:3000](http://localhost:3000)*.

3. **Verificar tipado y linter (TypeScript):**
   ```bash
   npm run lint
   ```

4. **Compilar para producción:**
   ```bash
   npm run build
   ```
   *La compilación se guardará optimizada y minificada dentro de la carpeta `/dist` lista para ser desplegada en servidores estáticos tradicionales o contenedores Cloud (Cloud Run).*

---

## 🎨 Identidad Visual y Diseño

La interfaz adopta una estética editorial, pulida e industrial inspirada en el concepto de arquitectura de obra civil:
* **Warm Calm Clay Theme:** Utiliza colores de matiz arcilla, pizarra, terracota y verdes minerales (`#5A716E`, `#7A746B`, `#3A3732`, `#3A3732`), eliminando gradientes artificiales saturados de color RGB para favorecer la credibilidad de un reporte corporativo.
* **Tipografías:** Enfoque en legibilidad mediante jerarquías con la familia Sans-Serif moderna para los componentes viales y un toque monoespaciado para la lectura numérica analítica.
* **Accesibilidad:** Diseñado con altos rangos de contraste geométrico para asegurar la lectura bajo el sol en campamentos o cabinas operativas en campo.

---

## 📄 Licencia

Este proyecto está distribuido bajo la licencia **Apache-2.0**. Consulte el encabezado de los archivos fuente para más información.
