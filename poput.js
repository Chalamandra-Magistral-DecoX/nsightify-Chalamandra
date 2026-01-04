document.addEventListener('DOMContentLoaded', () => {
  // Selectores de Penthouse
  const btnAction = document.getElementById('btnAction');
  const resultBox = document.getElementById('result');
  const loader = document.getElementById('loader');
  const canvas = document.getElementById('mapCanvas');
  const ctx = canvas.getContext('2d');

  let srapData = null; // Almacén de soberanía

  btnAction.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // UI Reset - Preparando el terreno
    btnAction.disabled = true;
    loader.classList.remove('hidden');
    resultBox.classList.add('hidden');
    document.getElementById('map-section').classList.add('hidden');

    // 1. SCAN: Extracción limpia del DOM
    chrome.tabs.sendMessage(tab.id, { action: "scanDOM" }, (response) => {
      if (!response) return showError("Fallo en SCAN");

      // 2. ANÁLISIS: Procesamiento con el PROMPT ELITE SRAP
      chrome.runtime.sendMessage({ action: "decodificar", text: response.text }, (res) => {
        loader.classList.add('hidden');
        btnAction.disabled = false;

        if (res.error) return showError(res.error);

        // Procesar la Salida Elite (JSON + Texto)
        try {
          // Asumimos que res.raw viene estructurado por el Prompt Elite
          const parts = res.raw.split("MAPA_VISUAL");
          const resumenText = parts[0].replace("RESUMEN", "").trim();
          const mapaJson = JSON.parse(parts[1].split("INSIGHT")[0].trim());
          const insightText = parts[1].split("INSIGHT")[1]?.trim();

          srapData = { resumen: resumenText, mapa: mapaJson, insight: insightText };

          // Mostrar Resumen y Insight
          resultBox.innerText = srapData.resumen;
          resultBox.classList.remove('hidden');
          
          if(srapData.insight) {
            const iBox = document.createElement('div');
            iBox.className = "insight-magistral";
            iBox.innerText = `INSIGHT: ${srapData.insight}`;
            resultBox.appendChild(iBox);
          }

          // 3. PRESENCIA: Dibujar el Grafo Neuronal
          drawNeuralGraph(srapData.mapa);
          document.getElementById('audio-controls').classList.remove('hidden');

        } catch (e) {
          showError("Error decodificando la estructura visual.");
        }
      });
    });
  });

  // Lógica de Dibujo de Grafos (Nivel Senior)
  function drawNeuralGraph(mapa) {
    document.getElementById('map-section').classList.remove('hidden');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    // Dibujar Nodo Central (Soberanía)
    drawNode(cx, cy, mapa.center || "NÚCLEO", "#FF003C", 18);

    // Dibujar Nodos Clave y Conexiones
    if (mapa.nodes) {
      mapa.nodes.forEach((node, i) => {
        const angle = (i * 2 * Math.PI) / mapa.nodes.length;
        const x = cx + Math.cos(angle) * 80;
        const y = cy + Math.sin(angle) * 80;

        // Línea de Conexión (Estilo Cyber)
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(x, y);
        ctx.strokeStyle = "rgba(0, 255, 234, 0.4)"; // Cyber Cyan
        ctx.setLineDash([4, 2]);
        ctx.stroke();
        ctx.setLineDash([]);

        drawNode(x, y, node.label, "#39FF14", 6); // Clarity Green

        // Sub-nodos (Children) del Prompt Elite
        if (node.children) {
            node.children.forEach((child, ci) => {
                const cAngle = angle + (ci - 0.5) * 0.5;
                const cx2 = x + Math.cos(cAngle) * 35;
                const cy2 = y + Math.sin(cAngle) * 35;
                
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(cx2, cy2);
                ctx.strokeStyle = "rgba(57, 255, 20, 0.2)";
                ctx.stroke();
                drawNode(cx2, cy2, "", "#00FFEA", 3);
            });
        }
      });
    }
  }

  function drawNode(x, y, label, color, size) {
    ctx.beginPath();
    ctx.arc(x, y, size, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = color;
    ctx.fill();
    ctx.shadowBlur = 0;
    
    if (label) {
      ctx.fillStyle = "#FFF";
      ctx.font = "bold 9px Rajdhani";
      ctx.textAlign = "center";
      ctx.fillText(label.toUpperCase(), x, y + size + 12);
    }
  }

  // SRAP Audio Beats
  document.getElementById('btnPlayAudio').addEventListener('click', () => {
    if(!srapData) return;
    window.speechSynthesis.cancel();
    const msg = new SpeechSynthesisUtterance(srapData.resumen);
    msg.lang = 'es-MX';
    msg.rate = 1.0;
    window.speechSynthesis.speak(msg);
  });

  function showError(m) {
    loader.classList.add('hidden');
    btnAction.disabled = false;
    alert(m);
  }
});
