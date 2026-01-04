/**
 * content.js - Sentinel de Integridad v4.5.1
 * Responsable del Silent Scan y la extracción quirúrgica del DOM.
 */

// 1. Silent Scan: Analiza la integridad apenas carga la página
const sentinelSilentScan = async () => {
  const payload = {
    action: "silentScan",
    url: window.location.href,
    title: document.title,
    // Enviamos un extracto inicial para el Firewall Paralelo
    text: document.body.innerText.substring(0, 3000),
    meta: document.querySelector('meta[name="description"]')?.content || ""
  };
  
  chrome.runtime.sendMessage(payload);
};

// Disparo automático basado en el estado del documento
if (document.readyState === "complete") {
  sentinelSilentScan();
} else {
  window.addEventListener("load", sentinelSilentScan);
}

// 2. Listener para Escaneo Profundo (Activado por el Popup)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "scanDOM") {
    // Prioridad de extracción: Artículos > Main > Body
    const rawContent = document.querySelector('article')?.innerText || 
                       document.querySelector('main')?.innerText || 
                       document.body.innerText;
    
    // Limpieza de ruido visual (scripts, estilos, espacios excesivos)
    const cleanContent = rawContent
      .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gmi, "")
      .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gmi, "")
      .replace(/\s+/g, ' ')
      .trim();
    
    sendResponse({ 
      text: cleanContent,
      title: document.title,
      url: window.location.href
    });
  }
});
