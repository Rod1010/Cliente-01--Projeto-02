const passwordEl = document.getElementById('password');
const lengthSlider = document.getElementById('length');
const lengthValue = document.getElementById('length-value');
const generateBtn = document.getElementById('generate-btn');
const copyBtn = document.getElementById('copy-btn');
const uppercaseCheck = document.getElementById('uppercase');
const lowercaseCheck = document.getElementById('lowercase');
const numbersCheck = document.getElementById('numbers');
const symbolsCheck = document.getElementById('symbols');
const entropyFill = document.getElementById('entropy-fill');
const entropyBits = document.getElementById('entropy-bits');
const entropyLabel = document.getElementById('entropy-label');

const SETS = {
  upper: 'ABCDEFGHJKLMNPQRSTUVWXYZ',
  lower: 'abcdefghijkmnopqrstuvwxyz',
  numbers: '23456789',
  symbols: '!@#$%^&*-_=+?'
};

let currentPassword = '';
let scrambleTimer = null;

lengthSlider.addEventListener('input', () => {
  lengthValue.textContent = lengthSlider.value;
});

[uppercaseCheck, lowercaseCheck, numbersCheck, symbolsCheck].forEach(el =>
  el.addEventListener('change', generatePassword)
);
lengthSlider.addEventListener('change', generatePassword);

function secureRandomIndex(max) {
  const range = 256 - (256 % max);
  let byte;
  do {
    byte = crypto.getRandomValues(new Uint8Array(1))[0];
  } while (byte >= range);
  return byte % max;
}

function pickFrom(str) {
  return str[secureRandomIndex(str.length)];
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = secureRandomIndex(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function generatePassword() {
  const length = parseInt(lengthSlider.value, 10);
  const active = [];
  if (uppercaseCheck.checked) active.push(SETS.upper);
  if (lowercaseCheck.checked) active.push(SETS.lower);
  if (numbersCheck.checked) active.push(SETS.numbers);
  if (symbolsCheck.checked) active.push(SETS.symbols);

  if (active.length === 0) {
    lowercaseCheck.checked = true;
    active.push(SETS.lower);
  }

  const pool = active.join('');
  const chars = [];

  active.forEach(set => chars.push(pickFrom(set)));
  while (chars.length < length) {
    chars.push(pickFrom(pool));
  }

  currentPassword = shuffle(chars).slice(0, length).join('');
  animateReveal(currentPassword);
  updateEntropy(length, pool.length);
}

function animateReveal(target) {
  clearInterval(scrambleTimer);
  const scrambleChars = SETS.upper + SETS.lower + SETS.numbers + SETS.symbols;
  const frames = 9;
  let frame = 0;
  scrambleTimer = setInterval(() => {
    frame++;
    let display = '';
    for (let i = 0; i < target.length; i++) {
      const settled = frame / frames > i / target.length;
      display += settled ? target[i] : pickFrom(scrambleChars);
    }
    passwordEl.textContent = display;
    if (frame >= frames) {
      clearInterval(scrambleTimer);
      passwordEl.textContent = target;
    }
  }, 28);
}

function updateEntropy(length, poolSize) {
  const bits = Math.round(length * Math.log2(poolSize));
  entropyBits.textContent = bits;

  let pct, color, label;
  if (bits < 40) {
    pct = (bits / 40) * 28;
    color = 'var(--weak)';
    label = 'fraca';
  } else if (bits < 60) {
    pct = 28 + ((bits - 40) / 20) * 28;
    color = 'var(--mid)';
    label = 'razoável';
  } else if (bits < 80) {
    pct = 56 + ((bits - 60) / 20) * 28;
    color = 'var(--mid)';
    label = 'forte';
  } else {
    pct = 84 + Math.min(((bits - 80) / 40) * 16, 16);
    color = 'var(--strong)';
    label = 'muito forte';
  }

  entropyFill.style.width = `${Math.min(pct, 100)}%`;
  entropyFill.style.background = color;
  entropyLabel.textContent = label;
}

copyBtn.addEventListener('click', async () => {
  if (!currentPassword) return;
  try {
    await navigator.clipboard.writeText(currentPassword);
    copyBtn.classList.add('copied');
    setTimeout(() => copyBtn.classList.remove('copied'), 1400);
  } catch (err) {
    console.error('Falha ao copiar', err);
  }
});

generateBtn.addEventListener('click', generatePassword);
document.addEventListener('keydown', e => {
  if (e.key === 'Enter') generatePassword();
});

generatePassword();