
// Function to ensure offscreen document exists
async function setupOffscreenDocument(path) {
  if (await chrome.offscreen.hasDocument()) {
    return;
  }
  await chrome.offscreen.createDocument({
    url: path,
    reasons: ['WORKERS'], // 'WORKERS' is appropriate for offloading heavy work
    justification: 'Processing AI requests with Gemini Nano',
  });
}

async function generateHash(text) {
  const msgBuffer = new TextEncoder().encode(text.substring(0, 5000));
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (["decodificar", "silentScan", "addToBlacklist"].includes(request.action)) {
    handleCortex(request).then(sendResponse);
    return true; 
  }
});

async function handleCortex(payload) {
  if (payload.action === "addToBlacklist") {
    const { blacklist = [] } = await chrome.storage.sync.get("blacklist");
    if (!blacklist.includes(payload.hash)) {
      blacklist.push(payload.hash);
      await chrome.storage.sync.set({ blacklist });
    }
    return { status: "UPDATED" };
  }

  const hash = await generateHash(payload.text);
  const { blacklist = [] } = await chrome.storage.sync.get("blacklist");
  const { cache = {} } = await chrome.storage.local.get("cache");

  if (blacklist.includes(hash)) return { status: "RIESGO", hash };
  if (cache[hash] && payload.action !== "decodificar") return { status: "SEGURO", cached: true, hash };

  if (payload.action === "decodificar") {
    try {
      // Setup offscreen document
      await setupOffscreenDocument('offscreen.html');

      // Send message to offscreen document
      const response = await chrome.runtime.sendMessage({
        action: 'decodificarOffscreen',
        text: payload.text
      });

      if (response.status === 'ERROR') {
        throw new Error(response.message);
      }

      const result = response.data;
      cache[hash] = result;
      await chrome.storage.local.set({ cache });
      return { status: "SUCCESS", data: result, hash };
    } catch (e) {
      console.error("Cortex Error:", e);
      return { status: "ERROR", message: e.message };
    }
  }
  return { status: "READY", hash };
}
