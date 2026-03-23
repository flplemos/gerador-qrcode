// Mapeando os elementos
const qrInput = document.getElementById('qr-input');
const generateBtn = document.getElementById('generate-btn');
const qrcodeContainer = document.getElementById('qrcode-container');
const resultArea = document.getElementById('result-area');
const downloadPureBtn = document.getElementById('download-pure-btn');
const downloadFramedBtn = document.getElementById('download-framed-btn');
const themeBtn = document.getElementById('theme-btn');

// Mapeando os novos inputs de customização
const sizeSelect = document.getElementById('qr-size');
const colorDarkInput = document.getElementById('qr-color-dark');
const colorLightInput = document.getElementById('qr-color-light');
const correctionSelect = document.getElementById('qr-correction');

const FRAME_CONFIG = {
    padding: 20,
    borderRadius: 12
};

generateBtn.addEventListener('click', () => {
    const inputValue = qrInput.value.trim();

    if (!inputValue) {
        alert("Por favor, insira um link ou texto válido.");
        qrInput.focus();
        return;
    }

    // Captura os valores selecionados nas opções
    const size = parseInt(sizeSelect.value);
    const colorDark = colorDarkInput.value;
    const colorLight = colorLightInput.value;
    
    // Mapeia o nível de correção selecionado para o objeto da biblioteca
    let correctLevel;
    switch(correctionSelect.value) {
        case 'L': correctLevel = QRCode.CorrectLevel.L; break;
        case 'M': correctLevel = QRCode.CorrectLevel.M; break;
        case 'Q': correctLevel = QRCode.CorrectLevel.Q; break;
        case 'H': correctLevel = QRCode.CorrectLevel.H; break;
        default: correctLevel = QRCode.CorrectLevel.M;
    }

    qrcodeContainer.innerHTML = "";

    // Aplica a cor de fundo selecionada à div externa para manter o design consistente
    qrcodeContainer.style.backgroundColor = colorLight;

    // Instancia a biblioteca com os valores dinâmicos
    new QRCode(qrcodeContainer, {
        text: inputValue,
        width: size,
        height: size,
        colorDark : colorDark,
        colorLight : colorLight,
        correctLevel : correctLevel
    });

    resultArea.classList.remove('hidden');
});

// Atualizamos a função para receber a cor de fundo (bgColor) como parâmetro
function generateCanvasWithBorder(originalCanvas, padding, borderRadius, bgColor) {
    const framedCanvas = document.createElement('canvas');
    const ctx = framedCanvas.getContext('2d');

    framedCanvas.width = originalCanvas.width + (padding * 2);
    framedCanvas.height = originalCanvas.height + (padding * 2);

    // Usa a cor de fundo selecionada pelo usuário em vez de branco fixo
    ctx.fillStyle = bgColor;
    
    if (ctx.roundRect) {
        ctx.roundRect(0, 0, framedCanvas.width, framedCanvas.height, borderRadius);
        ctx.fill();
    } else {
        ctx.fillRect(0, 0, framedCanvas.width, framedCanvas.height);
    }

    ctx.drawImage(originalCanvas, padding, padding);
    return framedCanvas;
}

// Downloads
downloadPureBtn.addEventListener('click', () => {
    const canvas = qrcodeContainer.querySelector('canvas');
    if (canvas) {
        const imageDataUrl = canvas.toDataURL("image/png");
        downloadImage(imageDataUrl, 'pure');
    } else {
        alert("Erro: QR Code não gerado.");
    }
});

downloadFramedBtn.addEventListener('click', () => {
    const originalCanvas = qrcodeContainer.querySelector('canvas');
    
    if (originalCanvas) {
        // Passamos a cor de fundo atual para a função de criar a borda
        const currentLightColor = colorLightInput.value;
        const framedCanvas = generateCanvasWithBorder(originalCanvas, FRAME_CONFIG.padding, FRAME_CONFIG.borderRadius, currentLightColor);
        
        const imageDataUrl = framedCanvas.toDataURL("image/png");
        downloadImage(imageDataUrl, 'framed');
    } else {
        alert("Erro: QR Code não gerado.");
    }
});

function downloadImage(dataUrl, suffix) {
    const downloadLink = document.createElement('a');
    downloadLink.href = dataUrl;
    const timestamp = new Date().getTime();
    downloadLink.download = `qrcode_${suffix}_${timestamp}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

qrInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        generateBtn.click();
    }
});

// --- Theme Toggle ---
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const isDarkMode = savedTheme ? savedTheme === 'dark' : prefersDark;
    
    if (!isDarkMode) {
        document.body.classList.add('light-mode');
        themeBtn.textContent = '☀️';
    } else {
        document.body.classList.remove('light-mode');
        themeBtn.textContent = '🌙';
    }
}

themeBtn.addEventListener('click', () => {
    const isLightMode = document.body.classList.toggle('light-mode');
    localStorage.setItem('theme', isLightMode ? 'light' : 'dark');
    themeBtn.textContent = isLightMode ? '☀️' : '🌙';
});

// Inicializar tema ao carregar a página
initTheme();