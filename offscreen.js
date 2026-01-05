// offscreen.js

class SessionManager {
  constructor() {
    this.session = null;
    this.usageCount = 0;
    this.createdAt = 0;
    this.maxUsage = 5; // Rotate session after 5 requests to clear context
    this.maxAge = 5 * 60 * 1000; // 5 minutes max life
    this.idleTimeout = null;
    this.IDLE_THRESHOLD = 30 * 1000; // 30 seconds idle
  }

  async getSession() {
    if (!window.ai || !window.ai.languageModel) {
      throw new Error("Gemini Nano is not available in this browser. Please check requirements.");
    }

    const { available } = await window.ai.languageModel.capabilities();
    if (available === 'no') {
      throw new Error("Gemini Nano is not available.");
    }

    // Check limits and rotate if needed
    if (this.session) {
      const age = Date.now() - this.createdAt;
      if (this.usageCount >= this.maxUsage || age > this.maxAge) {
        console.log(`[SessionManager] Rotating session. Usage: ${this.usageCount}, Age: ${age}ms`);
        this.destroySession();
      }
    }

    if (!this.session) {
      console.log("[SessionManager] Creating new session");
      // Note: For production, we manage session reuse/context here.
      this.session = await window.ai.languageModel.create();
      this.createdAt = Date.now();
      this.usageCount = 0;
    }

    this.cancelIdleTimer();
    return this.session;
  }

  releaseSession() {
    this.usageCount++;
    this.startIdleTimer();
  }

  destroySession() {
    if (this.session) {
      try {
        this.session.destroy();
      } catch (e) {
        console.warn("[SessionManager] Error destroying session", e);
      }
      this.session = null;
      this.usageCount = 0;
    }
  }

  startIdleTimer() {
    this.cancelIdleTimer();
    this.idleTimeout = setTimeout(() => {
      console.log("[SessionManager] Session idle timeout, destroying");
      this.destroySession();
    }, this.IDLE_THRESHOLD);
  }

  cancelIdleTimer() {
    if (this.idleTimeout) {
      clearTimeout(this.idleTimeout);
      this.idleTimeout = null;
    }
  }
}

const sessionManager = new SessionManager();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'decodificarOffscreen') {
    (async () => {
      try {
        const session = await sessionManager.getSession();

        const prompt = `Eres el Cortex Chalamandra. Genera un Resumen (7 puntos) y un Mapa JSON (center, nodes). Texto: ${request.text}`;

        const result = await session.prompt(prompt);

        sessionManager.releaseSession();

        sendResponse({ status: 'SUCCESS', data: result });
      } catch (error) {
        console.error("AI Error:", error);
        // Force destruction on error to ensure clean state
        sessionManager.destroySession();
        sendResponse({ status: 'ERROR', message: error.message });
      }
    })();
    return true; // Keep the message channel open for async response
  }
});
