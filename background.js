// Listener Principal - Mantiene la comunicación entre la interfaz y el cerebro
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "decodificar") {
    procesarSRAP(request.text).then(sendResponse);
    return true; 
  }
});

async function procesarSRAP(text) {
  try {
    // Verificación de API (Compatible con Chrome 130+)
    const capabilities = await ai.languageModel.capabilities();
    if (capabilities.available === "no") {
      return { error: "⚠️ El motor de IA local no está disponible en este navegador." };
    }

    // 1. FIREWALL COGNITIVO (SCAN)
    // Analiza los primeros 500 caracteres para detectar basura informativa
    const firewallSession = await ai.languageModel.create({
      systemPrompt: "Eres un Firewall Cognitivo de Chalamandra Magistral. Detecta clickbait o contenido irrelevante. Responde solo JSON: {status: 'seguro' o 'riesgo', motivo: 'breve'}"
    });
    
    const fwPrompt = `Analiza integridad: ${text.substring(0, 500)}`;
    const fwRaw = await firewallSession.prompt(fwPrompt);
    const fwResult = JSON.parse(limpiarJSON(fwRaw));
    firewallSession.destroy();

    // 2. DECODIFICACIÓN MAGISTRAL (ANÁLISIS)
    // Procesa hasta 2500 caracteres para generar el resumen y el mapa
    const mainSession = await ai.languageModel.create({
      systemPrompt: "Eres la IA Chalamandra. Decodificas texto complejo en estructuras de poder. Responde siempre en JSON estricto."
    });

    const mainPrompt = `
      Genera resumen y mapa mental (4 ramas principales).
      JSON: {"resumen": "...", "mapa": {"tema": "...", "ramas": [{"titulo": "...", "detalle": "..."}]}}
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
    console.error("Fallo en el sistema nervioso:", err);
    return { error: "Caos en el procesamiento: " + err.message };
  }
}

function limpiarJSON(str) {
  return str.replace(/```json/g, '').replace(/```/g, '').trim();
}
