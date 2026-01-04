// content.js - ESCANEO DE INTEGRIDAD DOM
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "scanDOM") {
    // Prioridad de extracción: Artículos, Contenido Principal o el Cuerpo total
    const rawContent = document.querySelector('article')?.innerText || 
                       document.querySelector('main')?.innerText || 
                       document.body.innerText;
    
    // Limpieza de ruido visual y espacios en blanco
    const cleanContent = rawContent.replace(/\s+/g, ' ').trim();
    
    sendResponse({ text: cleanContent });
  }
});
