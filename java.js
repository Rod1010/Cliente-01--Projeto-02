const passwordInput = document.getElementById('password');
const lengthSlider = document.getElementById('length');
const lengthValue = document.getElementById('length-value');
const generateBtn = document.getElementById('generate-btn');
const copyBtn = document.getElementById('copy-btn');

const uppercaseCheck = document.getElementById('uppercase');
const lowercaseCheck = document.getElementById('lowercase');
const numbersCheck = document.getElementById('numbers');
const symbolsCheck = document.getElementById('symbols');

const strengthBar = document.getElementById('strength-bar');
const strengthText = document.getElementById('strength-text');

// Atualiza valor do slider
lengthSlider.addEventListener('input', () => {
    lengthValue.textContent = lengthSlider.value;
});

// Gera senha
function generatePassword() {
    const length = parseInt(lengthSlider.value);
    
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const nums = '0123456789';
    const syms = '!@#$%^&*()_+-=[]{}|;:,.<>/?';

    let chars = '';
    if (uppercaseCheck.checked) chars += upper;
    if (lowercaseCheck.checked) chars += lower;
    if (numbersCheck.checked) chars += nums;
    if (symbolsCheck.checked) chars += syms;

    // Garante que pelo menos uma opção esteja ativa
    if (chars === '') {
        lowercaseCheck.checked = true;
        chars = lower;
    }

    let password = '';
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);

    for (let i = 0; i < length; i++) {
        password += chars[array[i] % chars.length];
    }

    passwordInput.value = password;
    updateStrength(password);
}

// Avalia força da senha
function updateStrength(password) {
    let score = 0;
    
    if (password.length >= 12) score++;
    if (password.length >= 16) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    let strength = 'Fraca';
    let color = '#ff4444';

    if (score >= 4) {
        strength = 'Forte';
        color = '#00ff9d';
    } else if (score >= 3) {
        strength = 'Média';
        color = '#ffaa00';
    }

    strengthBar.style.width = `${(score / 5) * 100}%`;
    strengthBar.style.background = color;
    strengthText.textContent = strength;
    strengthText.style.color = color;
}

// Copiar senha
copyBtn.addEventListener('click', async () => {
    if (!passwordInput.value) return;

    try {
        await navigator.clipboard.writeText(passwordInput.value);
        
        const originalText = copyBtn.textContent;
        copyBtn.textContent = '✅ Copiado!';
        copyBtn.style.background = '#00cc7a';
        
        setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.style.background = '';
        }, 2000);
    } catch (err) {
        alert('Erro ao copiar senha');
    }
});

// Gerar senha ao clicar no botão
generateBtn.addEventListener('click', generatePassword);

// Gerar senha inicial
generatePassword();