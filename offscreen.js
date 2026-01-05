// offscreen.js

// Function to get the language model session
async function getSession() {
  if (!window.ai || !window.ai.languageModel) {
    throw new Error("Gemini Nano is not available in this browser. Please check requirements.");
  }

  const { available } = await window.ai.languageModel.capabilities();
  if (available === 'no') {
     throw new Error("Gemini Nano is not available.");
  }

  // Create a new session
  // Note: For production, you might want to manage session reuse/context.
  const session = await window.ai.languageModel.create();
  return session;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'decodificarOffscreen') {
    (async () => {
      try {
        const session = await getSession();

        const prompt = `Eres el Cortex Chalamandra. Genera un Resumen (7 puntos) y un Mapa JSON (center, nodes). Texto: ${request.text}`;

        const result = await session.prompt(prompt);

        // Destroy session to free resources (optional, depending on usage frequency)
        session.destroy();

        sendResponse({ status: 'SUCCESS', data: result });
      } catch (error) {
        console.error("AI Error:", error);
        sendResponse({ status: 'ERROR', message: error.message });
      }
    })();
    return true; // Keep the message channel open for async response
  }
});

// Notify background that we are ready
chrome.runtime.sendMessage({ action: 'OFFSCREEN_READY' });
