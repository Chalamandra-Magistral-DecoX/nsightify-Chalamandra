chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "scanDOM") {
    // Seleccionamos contenido principal para evitar "basura"
    const bodyText = document.querySelector('article')?.innerText || 
                     document.querySelector('main')?.innerText || 
                     document.body.innerText;
    
    sendResponse({ text: bodyText });
  }
});
