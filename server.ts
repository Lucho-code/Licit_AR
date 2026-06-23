import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

// Simple in-memory rate limiter for the AI endpoint (no extra packages needed)
const _rl = new Map<string, { count: number; reset: number }>();
function rateLimited(ip: string, maxReq = 10, windowMs = 5 * 60_000): boolean {
  const now = Date.now();
  const entry = _rl.get(ip);
  if (!entry || now > entry.reset) { _rl.set(ip, { count: 1, reset: now + windowMs }); return false; }
  if (entry.count >= maxReq) return true;
  entry.count++;
  return false;
}

// Set up body parsers with limits for handling base64 uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Healthy check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Endpoint to analyze roadwork specification document and extract cost estimates
app.post("/api/analyze-pliego", async (req, res) => {
  const clientIp = req.ip ?? req.socket.remoteAddress ?? 'unknown';
  if (rateLimited(clientIp)) {
    return res.status(429).json({ error: "Demasiadas solicitudes. Esperá unos minutos antes de volver a analizar." });
  }

  try {
    const { fileName, fileType, fileData, textContent, userPrompt } = req.body;

    // Check if GEMINI_API_KEY is configured
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY no configurado en los Secretos. Por favor, agregue la clave en la configuración de la plataforma."
      });
    }

    // Initialize the official SDK
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    // We build standard parts depending on whether we received binary data or just text content
    type ContentPart = { text: string } | { inlineData: { mimeType: string; data: string } };
    const contentsParts: ContentPart[] = [];

    if (fileData && fileType) {
      // Support file uploads (PDF, text files, photos of specifications)
      // Strip base64 header if it's prefix-encoded
      const base64CleanData = fileData.includes(";base64,")
        ? fileData.split(";base64,")[1]
        : fileData;

      contentsParts.push({
        inlineData: {
          mimeType: fileType,
          data: base64CleanData,
        },
      });
    } else if (textContent) {
      contentsParts.push({
        text: `Contenido extraído del pliego de condiciones:\n\n${textContent}`,
      });
    } else {
      return res.status(400).json({
        error: "Debe proporcionar el contenido del archivo o los datos binarios para su análisis.",
      });
    }

    // Include the user instructions if supplied
    contentsParts.push({
      text: `Instrucciones adicionales del usuario o aclaraciones contractuales: ${
        userPrompt || "Ninguna especificada. Extraer o estimar coeficientes realistas según el pliego para la provincia de Santa Fe, Argentina."
      }\n\nAnaliza detenidamente el pliego y extrae obligatoriamente los coeficientes solicitados en el esquema estructurado de respuesta.`,
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: { parts: contentsParts },
      config: {
        systemInstruction: `Eres un ingeniero civil senior y especialista en análisis financiero contable para empresas constructoras viales en la provincia de Santa Fe, Argentina (febrero de 2026).
Tu tarea consiste en auditar el "Pliego de Bases y Condiciones Particulares" o "Cómputos y Presupuestos" provisto por un usuario y extraer o estimar de manera razonable y equilibrada las variables financieras requeridas para simular la oferta polinómica vial.

Directivas específicas para montos y coeficientes:
1. base_cd: Costo Directo Base de obra en Pesos Argentinos ($). Identifica el monto total de costos directos de obra, pavimentación, asfalto, terraplenes o sub-presupuestos. Si en el pliego solo hay descripciones cualitativas, estima un valor coherente al tipo de obra (ej: pavimentación urbana menor $45M a $85M; rutas interurbanas de gran escala $100M+).
2. base_cant_ant: Cantidad de Hormigón H-30 para acopio preventivo expresado en metros cúbicos (m³). Analiza si hay metros cúbicos de hormigón requeridos para calzada, cordón cuneta o bacheo. Si no indica cantidad de Hormigón H-30 o H-25, estima un volumen prudencial basado en el Costo Directo (entre 100 m³ y 600 m³, siendo 230 m³ el valor de referencia de escala).
3. base_p_h30: Precio por metro cúbico del Hormigón H-30 en ARS ($). Si el pliego no expresa el precio actualizado, estima un precio unitario de mercado para febrero de 2026 en Santa Fe (ej: entre $120.000 y $160.000 pesos por m³).
4. Coeficientes porcentuales (%):
   - t_ci (Costo Indirecto): porcentaje del costo directo aplicable (usualmente entre 12% y 25%).
   - t_seg (Seguros ART/RC): costo porcentual del directo para cobertura laboral y civil (típicamente 0.8% a 2.0%).
   - t_gg (Gastos Generales de Sede): porcentaje de amortización corporativa de oficinas centrales (un valor de 5.0% a 12.0%).
   - t_imp (Imprevistos de Campo): porcentaje para imprevistos geológicos o demoras (típicamente entre 2.0% y 6.0%).
   - t_fin (Interés o Costo Financiero de scoperto): porcentaje por financiamiento de caja descalzada (generalmente entre 0.5% y 3.0%).
5. plazo_obra: El plazo total de ejecución de la obra expresado en meses (por ejemplo, 2 meses de obra, 6 de obra, etc.). Si está especificado explícitamente en el pliego o el prompt del usuario (ej: '2 meses de obra'), use ese número exacto. Si no está indicado, estímalo razonablemente según el tamaño de la obra y complejidad vial (típicamente entre 2 y 24 meses).

Construye una justificación excelente ('explanation') explicando técnicamente de qué sección provienen o por qué consideras profesional estimar dichos rangos bajo el contexto vial santafesino de principios de 2026.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            base_cd: {
              type: Type.NUMBER,
              description: "Costo Directo Base de la obra ($ ARS).",
            },
            base_cant_ant: {
              type: Type.NUMBER,
              description: "Volumen estimado de Hormigón H-30 en m³ para acopio financiero preventivo.",
            },
            base_p_h30: {
              type: Type.NUMBER,
              description: "Precio estimado por m³ de Hormigón H-30 en $ ARS.",
            },
            t_ci: {
              type: Type.NUMBER,
              description: "Porcentaje de Costos Indirectos (% del Costo Directo).",
            },
            t_seg: {
              type: Type.NUMBER,
              description: "Porcentaje de Seguros (% del Costo Directo).",
            },
            t_gg: {
              type: Type.NUMBER,
              description: "Porcentaje de Gastos Generales (% del Subtotal Operativo + Inflación).",
            },
            t_imp: {
              type: Type.NUMBER,
              description: "Porcentaje de Imprevistos de Campo (% del CD + CI).",
            },
            t_fin: {
              type: Type.NUMBER,
              description: "Porcentaje de Costo Financiero Neto (% del Costo total deducido del anticipo).",
            },
            plazo_obra: {
              type: Type.NUMBER,
              description: "Plazo total de finalización de obra en meses (por ejemplo, 2, 6, 12, etc.). Debe ser un número entero mayor o igual a 1.",
            },
            estimatedTitle: {
              type: Type.STRING,
              description: "Título profesional literal o simplificado sugerido para esta simulación vial.",
            },
            estimatedLocation: {
              type: Type.STRING,
              description: "Localización de ejecución de la obra o jurisdicción vial provincial extraída.",
            },
            explanation: {
              type: Type.STRING,
              description: "Auditoría exhaustiva paso a paso detallando la extracción o los argumentos de estimación de cada variable.",
            },
          },
          required: [
            "base_cd",
            "base_cant_ant",
            "base_p_h30",
            "t_ci",
            "t_seg",
            "t_gg",
            "t_imp",
            "t_fin",
            "plazo_obra",
            "estimatedTitle",
            "estimatedLocation",
            "explanation",
          ],
        },
      },
    });

    const parsedData = JSON.parse(response.text || "{}");
    return res.json({ success: true, ...parsedData });
  } catch (error: any) {
    console.error("Error al procesar el documento con Gemini:", error);
    return res.status(500).json({
      error: "Error interno al analizar el pliego. " + (error.message || ""),
    });
  }
});

// Configure Vite in development, serve static files in production
async function configureServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting Express + Vite Dev Server...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving production build from dist/ folder...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server HTTP listo en http://localhost:${PORT}`);
  });
}

configureServer();
