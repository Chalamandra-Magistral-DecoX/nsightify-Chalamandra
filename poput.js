document.addEventListener('DOMContentLoaded', () => {
  // Selectores de la Interfaz Magistral
  const btnAction = document.getElementById('btnAction');
  const resultBox = document.getElementById('result');
  const loader = document.getElementById('loader');
  const fwBox = document.getElementById('firewall-status');
  const fwMsg = document.getElementById('firewall-msg');
  const mapSection = document.getElementById('map-section');
  const audioControls = document.getElementById('audio-controls');
  const canvas = document.getElementById('mapCanvas');

  let currentSummaryText = "";

  btnAction.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // UI Reset - Preparando el escenario
    btnAction.disabled = true;
    loader.classList.remove('hidden');
    resultBox.classList.add('hidden');
    mapSection.classList.add('hidden');
    audioControls.classList.add('hidden');
    fwBox.classList.remove('hidden');
    fwMsg.innerText = "Iniciando SCAN SRAP...";

    // 1. SCAN (Content Script) - Extrayendo la raíz
    chrome.tabs.sendMessage(tab.id, { action: "scanDOM" }, (response) => {
      if (!response || !response.text) {
        showError("La Chalamandra no detecta texto útil en esta zona.");
        return;
      }

      // 2. ANÁLISIS (Background) - Decodificación en el Sistema Nervioso
      chrome.runtime.sendMessage({ action: "decodificar", text: response.text }, (res) => {
        loader.classList.add('hidden');
        btnAction.disabled = false;

        if (res.error) {
          showError(res.error);
          return;
        }

        // A. Firewall Cognitivo - Protección Malandra
        if (res.firewall && res.firewall.status === "riesgo") {
          fwBox.style.borderColor = "#FF003C"; // Chaos Red
          fwMsg.innerHTML = `<strong style="color:#FF003C">⚠️ RIESGO:</strong> ${res.firewall.motivo}`;
        } else {
          fwBox.style.borderColor = "#39FF14"; // Clarity Green
          fwMsg.innerHTML = `<span style="color:#39FF14">✓ INTEGRIDAD TOTAL</span>`;
        }

        // B. Resumen Magistral
        if (res.data && res.data.resumen) {
          resultBox.classList.remove('hidden');
          resultBox.innerText = res.data.resumen;
          currentSummaryText = res.data.resumen;
          audioControls.classList.remove('hidden');
        }

        // C. Mapa Neuronal - Proyección Visual
        if (res.data && res.data.mapa) {
          drawMindMap(res.data.mapa);
        }
      });
    });
  });

  // --- SRAP BEATS (Audio) ---
  document.getElementById('btnPlayAudio').addEventListener('click', () => {
    if(currentSummaryText) playAudio(currentSummaryText);
  });
  
  document.getElementById('btnStopAudio').addEventListener('click', () => {
    window.speechSynthesis.cancel();
    document.querySelector('.pulse-icon').classList.remove('pulse-active');
  });

  function playAudio(text) {
    window.speechSynthesis.cancel();
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = 'es-MX';
    msg.onstart = () => document.querySelector('.pulse-icon').classList.add('pulse-active');
    msg.onend = () => document.querySelector('.pulse-icon').classList.remove('pulse-active');
    window.speechSynthesis.speak(msg);
  }

  // --- DIBUJO MAGISTRAL (Canvas) ---
  function drawMindMap(mapData) {
    const ctx = canvas.getContext('2d');
    mapSection.classList.remove('hidden');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    // Núcleo Central
    ctx.beginPath();
    ctx.arc(cx, cy, 20, 0, 2 * Math.PI);
    ctx.fillStyle = '#FF003C'; 
    ctx.fill();
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText("NÚCLEO", cx, cy + 4);

    // Ramas de Claridad
    if (mapData.ramas) {
      mapData.ramas.forEach((rama, i) => {
        const angle = (i * 2 * Math.PI) / mapData.ramas.length;
        const x = cx + Math.cos(angle) * 85;
        const y = cy + Math.sin(angle) * 85;

        // Conexión
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(x, y);
        ctx.strokeStyle = '#00FFEA'; // Cyber Cyan
        ctx.setLineDash([5, 3]);
        ctx.stroke();

        // Nodo
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, 2 * Math.PI);
        ctx.fillStyle = '#39FF14'; // Clarity Green
        ctx.fill();

        // Texto
        ctx.fillStyle = '#FFF';
        ctx.font = '9px Arial';
        ctx.textAlign = x > cx ? 'left' : 'right';
        ctx.fillText(rama.titulo.toUpperCase(), x + (x > cx ? 10 : -10), y + 3);
      });
    }
  }

  function showError(msg) {
    resultBox.classList.remove('hidden');
    resultBox.innerHTML = `<span style="color:#FF003C">ERROR: ${msg}</span>`;
    loader.classList.add('hidden');
    btnAction.disabled = false;
  }
});
