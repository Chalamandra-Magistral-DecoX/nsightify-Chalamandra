// Listener para procesar la síntesis
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "decodificar") {
    ejecutarIA(request.text).then(sendResponse);
    return true; // Mantiene el canal abierto para async
  }
});

async function ejecutarIA(text) {
  try {
    // Verificar si el navegador soporta IA local
    if (!window.ai || !window.ai.assistant) {
      return { error: "Gemini Nano no detectado. Activa los flags en chrome://flags/#optimization-guide-on-device-model" };
    }

    const session = await window.ai.assistant.create({
      systemPrompt: "Eres la IA de Chalamandra. Tu objetivo es transformar el caos informativo en claridad magistral. Resume de forma concisa y técnica."
    });

    const prompt = `Analiza y decodifica este contenido (SRAP Analysis): ${text.substring(0, 3000)}`;
    const result = await session.prompt(prompt);
    
    session.destroy();
    return { summary: result };
  } catch (err) {
    return { error: "Error en la Decodificación: " + err.message };
  }
}
