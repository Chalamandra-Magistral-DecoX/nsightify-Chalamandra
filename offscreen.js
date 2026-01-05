// offscreen.js

let cachedSession = null;
let destroyTimer = null;
let requestCount = 0;
const MAX_REQUESTS = 30;
const SESSION_TIMEOUT_MS = 20000; // 20 seconds

// Function to get the language model session
async function getSession() {
  if (!window.ai || !window.ai.languageModel) {
    throw new Error("Gemini Nano is not available in this browser. Please check requirements.");
  }

  const { available } = await window.ai.languageModel.capabilities();
  if (available === 'no') {
     throw new Error("Gemini Nano is not available.");
  }

  if (cachedSession) {
    if (requestCount >= MAX_REQUESTS) {
      console.log("Max requests reached. Refreshing session.");
      destroySession();
    } else {
      if (destroyTimer) clearTimeout(destroyTimer);
      return cachedSession;
    }
  }

  // Create a new session
  // Note: For production, you might want to manage session reuse/context.
  const session = await window.ai.languageModel.create();
  cachedSession = session;
  requestCount = 0;
  return session;
}

function destroySession() {
  if (destroyTimer) clearTimeout(destroyTimer);
  if (cachedSession) {
    try {
      cachedSession.destroy();
    } catch (e) {
      console.error("Error destroying session:", e);
    }
    cachedSession = null;
    requestCount = 0;
  }
}

function scheduleSessionDestroy() {
  if (destroyTimer) clearTimeout(destroyTimer);
  destroyTimer = setTimeout(() => {
    console.log("Session destroyed due to inactivity.");
    destroySession();
  }, SESSION_TIMEOUT_MS);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'decodificarOffscreen') {
    (async () => {
      try {
        const session = await getSession();

        const prompt = `Eres el Cortex Chalamandra. Genera un Resumen (7 puntos) y un Mapa JSON (center, nodes). Texto: ${request.text}`;

        const result = await session.prompt(prompt);
        requestCount++;

        // Schedule session destruction instead of immediate destruction
        scheduleSessionDestroy();

        sendResponse({ status: 'SUCCESS', data: result });
      } catch (error) {
        console.error("AI Error:", error);
        // Force destruction on error to ensure clean state
        destroySession();
        sendResponse({ status: 'ERROR', message: error.message });
      }
    })();
    return true; // Keep the message channel open for async response
  }
});

// Notify background that we are ready
chrome.runtime.sendMessage({ action: 'OFFSCREEN_READY' });
