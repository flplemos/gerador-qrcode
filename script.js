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

// Variável para armazenar informações do QR code
let currentQRConfig = {
    text: '',
    realSize: 256,
    colorDark: '#000000',
    colorLight: '#ffffff',
    correctLevel: QRCode.CorrectLevel.M
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

    // Armazena a configuração do QR code
    currentQRConfig = {
        text: inputValue,
        realSize: size,
        colorDark: colorDark,
        colorLight: colorLight,
        correctLevel: correctLevel
    };

    qrcodeContainer.innerHTML = "";

    // Aplica a cor de fundo selecionada à div externa
    qrcodeContainer.style.backgroundColor = colorLight;

    // Define um tamanho máximo para exibição na tela (350px)
    const displaySize = Math.min(size, 350);

    // Instancia a biblioteca com o tamanho reduzido para exibição
    new QRCode(qrcodeContainer, {
        text: inputValue,
        width: displaySize,
        height: displaySize,
        colorDark : colorDark,
        colorLight : colorLight,
        correctLevel : correctLevel
    });

    // Atualiza a informação de tamanho real
    document.getElementById('qrcode-size-info').textContent = `${size}x${size}px`;

    resultArea.classList.remove('hidden');
});

// --- Atualização automática das customizações ---
// Agrupamos os inputs de customização em um array
const customizationInputs = [sizeSelect, colorDarkInput, colorLightInput, correctionSelect];

customizationInputs.forEach(input => {
    // Para inputs de cor, 'input' atualiza em tempo real enquanto o usuário arrasta o mouse.
    // Para os <select>, 'change' funciona perfeitamente.
    const eventType = input.type === 'color' ? 'input' : 'change';
    
    input.addEventListener(eventType, () => {
        // Verifica se a área do QR Code já está visível e se o input de texto não está vazio
        if (!resultArea.classList.contains('hidden') && qrInput.value.trim() !== '') {
            // Simula um clique no botão gerar para refazer o QR Code com as novas opções
            generateBtn.click();
        }
    });
});

// Função para gerar canvas com borda
function generateCanvasWithBorder(originalCanvas, padding, borderRadius, bgColor) {
    const framedCanvas = document.createElement('canvas');
    const ctx = framedCanvas.getContext('2d');

    framedCanvas.width = originalCanvas.width + (padding * 2);
    framedCanvas.height = originalCanvas.height + (padding * 2);

    // Usa a cor de fundo selecionada pelo usuário
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
    const container = document.createElement('div');
    container.style.display = 'none';
    document.body.appendChild(container);

    // Gera o QR code em tamanho real para download
    new QRCode(container, {
        text: currentQRConfig.text,
        width: currentQRConfig.realSize,
        height: currentQRConfig.realSize,
        colorDark : currentQRConfig.colorDark,
        colorLight : currentQRConfig.colorLight,
        correctLevel : currentQRConfig.correctLevel
    });

    // Aguarda um pouco para o QR code ser renderizado
    setTimeout(() => {
        const canvas = container.querySelector('canvas');
        if (canvas) {
            const imageDataUrl = canvas.toDataURL("image/png");
            downloadImage(imageDataUrl, 'pure');
        } else {
            alert("Erro: QR Code não gerado.");
        }
        document.body.removeChild(container);
    }, 100);
});

downloadFramedBtn.addEventListener('click', () => {
    const container = document.createElement('div');
    container.style.display = 'none';
    document.body.appendChild(container);

    // Gera o QR code em tamanho real para download
    new QRCode(container, {
        text: currentQRConfig.text,
        width: currentQRConfig.realSize,
        height: currentQRConfig.realSize,
        colorDark : currentQRConfig.colorDark,
        colorLight : currentQRConfig.colorLight,
        correctLevel : currentQRConfig.correctLevel
    });

    // Aguarda um pouco para o QR code ser renderizado
    setTimeout(() => {
        const originalCanvas = container.querySelector('canvas');
        if (originalCanvas) {
            const framedCanvas = generateCanvasWithBorder(originalCanvas, FRAME_CONFIG.padding, FRAME_CONFIG.borderRadius, currentQRConfig.colorLight);
            const imageDataUrl = framedCanvas.toDataURL("image/png");
            downloadImage(imageDataUrl, 'framed');
        } else {
            alert("Erro: QR Code não gerado.");
        }
        document.body.removeChild(container);
    }, 100);
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