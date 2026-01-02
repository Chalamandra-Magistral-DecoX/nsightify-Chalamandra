document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('btnAction');
  const resultBox = document.getElementById('result');
  const loader = document.getElementById('loader');
  const fwBox = document.getElementById('firewall-status');
  const fwMsg = document.getElementById('firewall-msg');
  const mapSection = document.getElementById('map-section');
  const audioControls = document.getElementById('audio-controls');

  let currentSummaryText = "";

  btn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // UI Reset
    btn.disabled = true;
    loader.classList.remove('hidden');
    resultBox.classList.add('hidden');
    mapSection.classList.add('hidden');
    audioControls.classList.add('hidden');
    fwBox.classList.remove('hidden');
    fwMsg.innerText = "Escaneando integridad...";
    fwBox.style.borderColor = "var(--cyber-cyan)";

    // 1. SCAN (Content Script)
    chrome.tabs.sendMessage(tab.id, { action: "scanDOM" }, (response) => {
      if (!response || !response.text) {
        showError("No se pudo extraer texto.");
        return;
      }

      // 2. PROCESAMIENTO SRAP (Background)
      chrome.runtime.sendMessage({ action: "decodificar", text: response.text }, (res) => {
        loader.classList.add('hidden');
        btn.disabled = false;

        if (res.error) {
          showError(res.error);
          return;
        }

        // A. Manejo del Firewall
        if (res.firewall && res.firewall.status === "riesgo") {
          fwBox.style.borderColor = "var(--chaos-red)";
          fwMsg.innerHTML = `<strong style="color:var(--chaos-red)">⚠️ ALERTA:</strong> ${res.firewall.motivo}`;
        } else {
          fwBox.style.borderColor = "var(--clarity-green)";
          fwMsg.innerHTML = `<span style="color:var(--clarity-green)">✓ Seguro</span> • Energía protegida`;
        }

        // B. Mostrar Resumen Texto
        if (res.data && res.data.resumen) {
          resultBox.classList.remove('hidden');
          resultBox.innerText = res.data.resumen;
          currentSummaryText = res.data.resumen;
          
          // Activar Audio
          audioControls.classList.remove('hidden');
        }

        // C. Dibujar Mapa
        if (res.data && res.data.mapa) {
          drawMindMap(res.data.mapa);
        }
      });
    });
  });

  // --- Funciones de Audio ---
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
    msg.rate = 1.0;
    msg.pitch = 1.0;
    
    msg.onstart = () => document.querySelector('.pulse-icon').classList.add('pulse-active');
    msg.onend = () => document.querySelector('.pulse-icon').classList.remove('pulse-active');
    
    window.speechSynthesis.speak(msg);
  }

  // --- Función de Dibujo (Canvas) ---
  function drawMindMap(mapData) {
    const canvas = document.getElementById('mapCanvas');
    const ctx = canvas.getContext('2d');
    mapSection.classList.remove('hidden');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const radius = 60;

    // Nodo Central (Caos/Núcleo)
    ctx.beginPath();
    ctx.arc(cx, cy, 15, 0, 2 * Math.PI);
    ctx.fillStyle = '#FF003C'; // Rojo
    ctx.fill();
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 8px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(mapData.tema ? mapData.tema.substring(0,8) : "NÚCLEO", cx, cy + 3);

    // Ramas (Claridad)
    if (mapData.ramas && mapData.ramas.length > 0) {
      mapData.ramas.forEach((rama, i) => {
        const angle = (i * 2 * Math.PI) / mapData.ramas.length;
        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius;

        // Línea
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(x, y);
        ctx.strokeStyle = '#00FFEA'; // Cyan
        ctx.lineWidth = 1;
        ctx.stroke();

        // Nodo Rama
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = '#39FF14'; // Verde
        ctx.fill();

        // Texto Rama
        ctx.fillStyle = '#e0e0ff';
        ctx.font = '8px Arial';
        // Ajuste de texto según lado
        ctx.textAlign = x > cx ? 'left' : 'right';
        ctx.fillText(rama.titulo.substring(0, 12), x + (x > cx ? 8 : -8), y + 3);
      });
    }
  }

  function showError(msg) {
    resultBox.classList.remove('hidden');
    resultBox.innerHTML = `<span style="color:#FF003C">Error: ${msg}</span>`;
    loader.classList.add('hidden');
  }
});
