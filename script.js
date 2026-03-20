// Mapeando os novos elementos
const qrInput = document.getElementById('qr-input');
const generateBtn = document.getElementById('generate-btn');
const qrcodeContainer = document.getElementById('qrcode-container');
const resultArea = document.getElementById('result-area');
const downloadPureBtn = document.getElementById('download-pure-btn');
const downloadFramedBtn = document.getElementById('download-framed-btn');

// Configurações da moldura (recriando o CSS programaticamente)
const FRAME_CONFIG = {
    padding: 20, // Padding em pixels (igual ao CSS padding: 20px)
    borderRadius: 12 // Raio da borda em pixels (igual ao CSS border-radius: 12px)
};

// Função para gerar o QR Code
generateBtn.addEventListener('click', () => {
    const inputValue = qrInput.value.trim();

    if (!inputValue) {
        alert("Por favor, insira um link ou texto válido.");
        qrInput.focus();
        return;
    }

    // Limpa o contêiner anterior
    qrcodeContainer.innerHTML = "";

    // Instancia a biblioteca (usando correção M para códigos cleans)
    new QRCode(qrcodeContainer, {
        text: inputValue,
        width: 250,
        height: 250,
        colorDark : "#000000",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.M 
    });

    // Mostra a área de resultado
    resultArea.classList.remove('hidden');
});

// --- Função Auxiliar do Mentor: Criar um Canvas Composto com Moldura ---
function generateCanvasWithBorder(originalCanvas, padding, borderRadius) {
    // 1. Cria o novo canvas virtual
    const framedCanvas = document.createElement('canvas');
    const ctx = framedCanvas.getContext('2d');

    // 2. Define as dimensões do novo canvas (Original + Padding total)
    framedCanvas.width = originalCanvas.width + (padding * 2);
    framedCanvas.height = originalCanvas.height + (padding * 2);

    // 3. Desenha o fundo branco com cantos arredondados
    ctx.fillStyle = "#ffffff";
    
    // Usamos roundRect (uma função moderna do canvas) ou um fallback sutil
    if (ctx.roundRect) {
        ctx.roundRect(0, 0, framedCanvas.width, framedCanvas.height, borderRadius);
        ctx.fill();
    } else {
        // Fallback simples para navegadores muito antigos (desenha retângulo sem arredondamento)
        ctx.fillRect(0, 0, framedCanvas.width, framedCanvas.height);
    }

    // 4. Desenha o QR Code original centralizado dentro do fundo branco
    ctx.drawImage(originalCanvas, padding, padding);

    return framedCanvas;
}

// --- Funções de Download ---

// 1. Download do código PURO (Comportamento original)
downloadPureBtn.addEventListener('click', () => {
    const canvas = qrcodeContainer.querySelector('canvas');
    if (canvas) {
        const imageDataUrl = canvas.toDataURL("image/png");
        downloadImage(imageDataUrl, 'pure');
    } else {
        alert("Erro: QR Code não gerado.");
    }
});

// 2. Download do código COM BORDA (O desafio!)
downloadFramedBtn.addEventListener('click', () => {
    const originalCanvas = qrcodeContainer.querySelector('canvas');
    
    if (originalCanvas) {
        // Gera o canvas composto usando nossa função auxiliar
        const framedCanvas = generateCanvasWithBorder(originalCanvas, FRAME_CONFIG.padding, FRAME_CONFIG.borderRadius);
        
        // Gera a imagem do download a partir do canvas composto
        const imageDataUrl = framedCanvas.toDataURL("image/png");
        downloadImage(imageDataUrl, 'framed');
    } else {
        alert("Erro: QR Code não gerado.");
    }
});

// Função utilitária para fazer o download
function downloadImage(dataUrl, suffix) {
    const downloadLink = document.createElement('a');
    downloadLink.href = dataUrl;
    
    const timestamp = new Date().getTime();
    downloadLink.download = `qrcode_${suffix}_${timestamp}.png`;

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

// Permitir gerar ao pressionar "Enter"
qrInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        generateBtn.click();
    }
});