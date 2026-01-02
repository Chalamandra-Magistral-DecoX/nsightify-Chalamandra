// Listener Principal
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "decodificar") {
    procesarSRAP(request.text).then(sendResponse);
    return true; // Mantiene canal abierto
  }
});

// Orquestador SRAP (Scan, Ritmo, Análisis, Presencia)
async function procesarSRAP(text) {
  try {
    // Verificar disponibilidad de Gemini Nano
    if (!window.ai || !window.ai.assistant) {
      return { error: "⚠️ Gemini Nano no activo. Habilita los flags en chrome://flags." };
    }

    // 1. FIREWALL COGNITIVO (Análisis de Riesgo)
    const firewallSession = await window.ai.assistant.create({
      systemPrompt: "Eres un Firewall Cognitivo. Tu único trabajo es detectar clickbait o contenido basura. Responde solo con JSON válido."
    });
    
    const fwPrompt = `Analiza este texto. Responde JSON: {"status": "seguro" o "riesgo", "motivo": "breve razón"}. Texto: ${text.substring(0, 500)}`;
    let fwResult;
    try {
      const fwRaw = await firewallSession.prompt(fwPrompt);
      fwResult = JSON.parse(limpiarJSON(fwRaw));
    } catch (e) {
      fwResult = { status: "seguro", motivo: "Verificación offline" }; // Fallback
    }
    firewallSession.destroy();

    // 2. DECODIFICACIÓN MAGISTRAL (Resumen + Mapa)
    const mainSession = await window.ai.assistant.create({
      systemPrompt: "Eres la IA Chalamandra. Resumes texto y creas estructuras de mapas mentales. Responde siempre en JSON."
    });

    const mainPrompt = `
      Analiza este contenido. Genera un resumen y datos para un mapa mental.
      Formato JSON estricto:
      {
        "resumen": "Tu resumen conciso aquí...",
        "mapa": {
          "tema": "Concepto Central",
          "ramas": [
            {"titulo": "Rama 1", "detalle": "Info"},
            {"titulo": "Rama 2", "detalle": "Info"},
            {"titulo": "Rama 3", "detalle": "Info"},
            {"titulo": "Rama 4", "detalle": "Info"}
          ]
        }
      }
      Texto: ${text.substring(0, 2500)}
    `;

    const mainRaw = await mainSession.prompt(mainPrompt);
    const mainData = JSON.parse(limpiarJSON(mainRaw));
    mainSession.destroy();

    return { 
      firewall: fwResult, 
      data: mainData 
    };

  } catch (err) {
    console.error(err);
    return { error: "Error en procesamiento neuronal: " + err.message };
  }
}

// Utilería para limpiar respuestas de IA (a veces meten markdown ```json ... ```)
function limpiarJSON(str) {
  return str.replace(/```json/g, '').replace(/```/g, '').trim();
}
