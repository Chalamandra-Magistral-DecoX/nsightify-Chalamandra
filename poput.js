const btn = document.getElementById('btnAction');
const resultBox = document.getElementById('result');
const loader = document.getElementById('loader');

btn.addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  btn.disabled = true;
  loader.classList.remove('hidden');
  resultBox.innerText = "Escaneando DOM...";

  // 1. Scan (SRAP Phase 1)
  chrome.tabs.sendMessage(tab.id, { action: "scanDOM" }, (response) => {
    if (response && response.text) {
      // 2. Análisis (SRAP Phase 3)
      chrome.runtime.sendMessage({ action: "decodificar", text: response.text }, (aiRes) => {
        loader.classList.add('hidden');
        btn.disabled = false;
        
        if (aiRes.error) {
          resultBox.innerHTML = `<span style="color: #FF003C">${aiRes.error}</span>`;
        } else {
          resultBox.innerText = aiRes.summary;
        }
      });
    }
  });
});
