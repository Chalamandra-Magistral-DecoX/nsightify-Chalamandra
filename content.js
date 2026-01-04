const sentinelSilentScan = async () => {
  const payload = {
    action: "silentScan",
    url: window.location.href,
    title: document.title,
    text: document.body.innerText.substring(0, 3000)
  };
  chrome.runtime.sendMessage(payload);
};

if (document.readyState === "complete") {
  sentinelSilentScan();
} else {
  window.addEventListener("load", sentinelSilentScan);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "scanDOM") {
    const rawContent = document.querySelector('article')?.innerText || 
                       document.querySelector('main')?.innerText || 
                       document.body.innerText;
    
    const cleanContent = rawContent.replace(/\s+/g, ' ').trim();
    
    sendResponse({ 
      text: cleanContent,
      title: document.title,
      url: window.location.href
    });
  }
});
