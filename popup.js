document.addEventListener('DOMContentLoaded', () => {
    const btnAction = document.getElementById('btnAction');
    const identiconBox = document.getElementById('identicon');
    const resultBox = document.getElementById('result');
    const loader = document.getElementById('loader');
    const audioPanel = document.getElementById('audio-controls');
    let currentHash = "";

    // Función para generar el Identicon Visual
    function updateIdenticon(hash) {
        const hue = parseInt(hash.substring(0, 2), 16);
        const color = `hsla(${hue}, 80%, 60%, 0.9)`;
        identiconBox.innerHTML = `
            <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="10" stroke="${color}" stroke-width="2" fill="none"/>
                <path d="M16 8 L22 24 L10 24 Z" fill="${color}" opacity="0.6">
                    <animateTransform attributeName="transform" type="rotate" from="0 16 16" to="360 16 16" dur="10s" repeatCount="indefinite"/>
                </path>
            </svg>`;
    }

    btnAction.addEventListener('click', async () => {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        // Evitar escaneo en páginas protegidas de Chrome
        if (tab.url.startsWith("chrome://")) {
            resultBox.innerText = "No se puede escanear páginas del sistema.";
            resultBox.classList.remove('hidden');
            return;
        }

        btnAction.disabled = true;
        loader.classList.remove('hidden');
        resultBox.classList.add('hidden');
        audioPanel.classList.add('hidden');

        // 1. Pedir texto al Sentinel (content.js)
        chrome.tabs.sendMessage(tab.id, { action: "scanDOM" }, (response) => {
            if (chrome.runtime.lastError || !response) {
                loader.classList.add('hidden');
                resultBox.innerText = "Error: Sentinel no responde. Recarga la página.";
                resultBox.classList.remove('hidden');
                btnAction.disabled = false;
                return;
            }

            // 2. Enviar al Cortex (background.js) para análisis de IA
            chrome.runtime.sendMessage({ action: "decodificar", text: response.text }, (res) => {
                loader.classList.add('hidden');
                btnAction.disabled = false;

                if (chrome.runtime.lastError || !res) {
                    resultBox.innerText = "Cortex fuera de línea.";
                    resultBox.classList.remove('hidden');
                    return;
                }

                if (res.hash) {
                    currentHash = res.hash;
                    updateIdenticon(res.hash);
                }

                if (res.data) {
                    resultBox.innerText = res.data.split('{')[0];
                    resultBox.classList.remove('hidden');
                    audioPanel.classList.remove('hidden');
                }
            });
        });
    });

    // Control de Audio con Vibración CSS
    document.getElementById('btnPlay').addEventListener('click', () => {
        const text = resultBox.innerText;
        const synth = window.speechSynthesis;
        const utter = new SpeechSynthesisUtterance(text.substring(0, 400));
        
        // ACTIVAR VIBRACIÓN NEÓN
        utter.onstart = () => identiconBox.classList.add('vibrating');
        // DESACTIVAR AL TERMINAR
        utter.onend = () => identiconBox.classList.remove('vibrating');
        
        synth.speak(utter);
    });
});
