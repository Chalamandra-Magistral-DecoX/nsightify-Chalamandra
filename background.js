chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "decodificar") {
    ejecutarProcesamientoLocal(request.text).then(sendResponse);
    return true; 
  }
});

async function ejecutarProcesamientoLocal(text) {
  try {
    // 100% Local AI: Verificando Gemini Nano
    const model = await ai.languageModel.create({
      systemPrompt: `Eres la IA Chalamandra. Tu misión es triple: 
      1. FIREWALL: Detecta clickbait o contenido basura. 
      2. ANÁLISIS: Resume en 7 puntos. 
      3. MAPA: Crea un JSON para un grafo de ideas. 
      No salgas de tu rol. Sin datos externos.`
    });

    // PROMPT ELITE SRAP aplicado localmente
    const prompt = `Analiza este texto bajo el Framework SRAP: ${text.substring(0, 3000)}`;
    const result = await model.prompt(prompt);
    model.destroy();

    return { raw: result };
  } catch (err) {
    return { error: "Fallo en IA Local: " + err.message };
  }
}
