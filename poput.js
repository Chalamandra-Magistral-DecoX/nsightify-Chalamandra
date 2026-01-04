document.addEventListener('DOMContentLoaded', () => {
  const btnAction = document.getElementById('btnAction');
  const identiconBox = document.getElementById('identicon');
  const canvas = document.getElementById('mapCanvas');
  const ctx = canvas.getContext('2d');
  let currentHash = "", lastData = "";

  function getIdenticon(hash) {
    const hue = parseInt(hash.substring(0, 2), 16);
    const color = `hsla(${hue}, 80%, 60%, 0.8)`;
    return `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="12" fill="none" stroke="${color}" stroke-width="1" />
      <path d="M16 4 L28 24 L4 24 Z" fill="${color}" opacity="0.5" transform="rotate(${hue}, 16, 16)"/>
    </svg>`;
  }

  btnAction.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    btnAction.disabled = true;
    document.getElementById('loader').classList.remove('hidden');

    chrome.tabs.sendMessage(tab.id, { action: "scanDOM" }, (payload) => {
      chrome.runtime.sendMessage({ action: "decodificar", ...payload }, (res) => {
        document.getElementById('loader').classList.add('hidden');
        btnAction.disabled = false;

        if (res.hash) {
          currentHash = res.hash;
          identiconBox.innerHTML = getIdenticon(res.hash);
        }

        if (res.status === "RIESGO") {
          document.getElementById('riskArea').classList.remove('hidden');
          identiconBox.classList.add('glitch-identicon');
          return;
        }

        if (res.data) {
          lastData = res.data;
          document.getElementById('result').innerText = res.data.split('{')[0];
          document.getElementById('result').classList.remove('hidden');
          document.getElementById('audio-controls').classList.remove('hidden');
          drawNeuralNode();
        }
      });
    });
  });

  document.getElementById('btnPlay').addEventListener('click', () => {
    const synth = window.speechSynthesis;
    const utter = new SpeechSynthesisUtterance(lastData.substring(0, 300));
    utter.onstart = () => identiconBox.classList.add('vibrating-magistral');
    utter.onend = () => identiconBox.classList.remove('vibrating-magistral');
    synth.speak(utter);
  });

  function drawNeuralNode() {
    document.getElementById('map-section').classList.remove('hidden');
    ctx.fillStyle = "#00FFEA";
    ctx.shadowBlur = 15; ctx.shadowColor = "#00FFEA";
    ctx.beginPath(); ctx.arc(140, 100, 12, 0, Math.PI*2); ctx.fill();
  }
});
