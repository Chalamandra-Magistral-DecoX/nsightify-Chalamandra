document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('btnAction');
  const resultBox = document.getElementById('result');
  const audioBox = document.getElementById('audio-controls');
  let currentText = "";

  btn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // SCAN (Content Script)
    chrome.tabs.sendMessage(tab.id, { action: "scanDOM" }, (response) => {
      // ANÁLISIS (IA Local)
      chrome.runtime.sendMessage({ action: "decodificar", text: response.text }, (res) => {
        if (res.error) return alert(res.error);
        
        // Firewall Cognitivo: Filtrando basura
        currentText = res.raw;
        resultBox.innerText = currentText;
        resultBox.classList.remove('hidden');
        audioBox.classList.remove('hidden');
        
        // Mapas Neuronales: Visualización interactiva
        renderVisualMap();
      });
    });
  });

  // SRAP Audio Beats: Sintetización rítmica
  document.getElementById('btnPlayAudio').addEventListener('click', () => {
    const synth = window.speechSynthesis;
    const utter = new SpeechSynthesisUtterance(currentText);
    utter.rate = 1.1; // Ritmo magistral
    synth.speak(utter);
  });
});

function renderVisualMap() {
  const canvas = document.getElementById('mapCanvas');
  const ctx = canvas.getContext('2d');
  document.getElementById('map-section').classList.remove('hidden');
  // Lógica de dibujo de nodos y conexiones
}
