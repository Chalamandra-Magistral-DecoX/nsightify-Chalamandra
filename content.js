chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "scanDOM") {
    // Prioridad: Article > Main > Body
    const content = document.querySelector('article')?.innerText || 
                    document.querySelector('main')?.innerText || 
                    document.body.innerText;
    
    // Limpieza básica de espacios
    const cleanText = content.replace(/\s+/g, ' ').trim();
    
    sendResponse({ text: cleanText });
  }
});
