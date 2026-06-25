const characterSets = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
};

const passwordOutput = document.querySelector("#password-output");
const copyButton = document.querySelector("#copy-button");
const generateButton = document.querySelector("#generate-button");
const lengthSlider = document.querySelector("#length-slider");
const lengthValue = document.querySelector("#length-value");
const strengthLabel = document.querySelector("#strength-label");
const strengthBar = document.querySelector("#strength-bar");
const optionInputs = [...document.querySelectorAll(".options input[type='checkbox']")];

let copyResetTimer;

const getRandomIndex = (max) => {
  const randomValues = new Uint32Array(1);
  const limit = Math.floor(0x100000000 / max) * max;
  let randomNumber;

  do {
    crypto.getRandomValues(randomValues);
    randomNumber = randomValues[0];
  } while (randomNumber >= limit);

  return randomNumber % max;
};

const shuffleSecurely = (characters) => {
  const shuffled = [...characters];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = getRandomIndex(index + 1);
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }

  return shuffled.join("");
};

const getSelectedSets = () =>
  optionInputs
    .filter((input) => input.checked)
    .map((input) => characterSets[input.id]);

const enforceOneOption = (changedInput) => {
  const checkedOptions = optionInputs.filter((input) => input.checked);

  if (checkedOptions.length === 0) {
    changedInput.checked = true;
  }
};

const generatePassword = () => {
  const length = Number(lengthSlider.value);
  const selectedSets = getSelectedSets();
  const allCharacters = selectedSets.join("");
  const requiredCharacters = selectedSets.map((set) => set[getRandomIndex(set.length)]);
  const remainingLength = length - requiredCharacters.length;
  const generatedCharacters = [...requiredCharacters];

  for (let index = 0; index < remainingLength; index += 1) {
    generatedCharacters.push(allCharacters[getRandomIndex(allCharacters.length)]);
  }

  return shuffleSecurely(generatedCharacters).slice(0, length);
};

const getStrength = () => {
  const length = Number(lengthSlider.value);
  const diversity = getSelectedSets().length;
  let score = 0;

  if (length >= 12) score += 1;
  if (length >= 16) score += 1;
  if (length >= 24) score += 1;
  if (diversity >= 2) score += 1;
  if (diversity >= 3) score += 1;
  if (diversity === 4) score += 1;

  if (score <= 2) return { label: "Fraca", className: "is-weak" };
  if (score <= 4) return { label: "Média", className: "is-medium" };
  return { label: "Forte", className: "is-strong" };
};

const updateStrength = () => {
  const strength = getStrength();

  strengthLabel.textContent = strength.label;
  strengthBar.className = `strength-bar ${strength.className}`;
};

const refreshPassword = () => {
  lengthValue.value = lengthSlider.value;
  lengthValue.textContent = lengthSlider.value;
  passwordOutput.value = generatePassword();
  updateStrength();
};

const showCopyFeedback = (message, copied = true) => {
  clearTimeout(copyResetTimer);
  copyButton.textContent = message;
  copyButton.setAttribute("aria-label", copied ? "Senha copiada" : "Falha ao copiar senha");
  copyButton.classList.toggle("is-copied", copied);

  copyResetTimer = window.setTimeout(() => {
    copyButton.textContent = "Copiar";
    copyButton.setAttribute("aria-label", "Copiar senha");
    copyButton.classList.remove("is-copied");
  }, 1600);
};

const copyPassword = async () => {
  if (!passwordOutput.value) return;

  try {
    await navigator.clipboard.writeText(passwordOutput.value);
    showCopyFeedback("Copiado");
  } catch {
    showCopyFeedback("Falhou", false);
  }
};

lengthSlider.addEventListener("input", refreshPassword);
generateButton.addEventListener("click", refreshPassword);
copyButton.addEventListener("click", copyPassword);

optionInputs.forEach((input) => {
  input.addEventListener("change", () => {
    enforceOneOption(input);
    refreshPassword();
  });
});

refreshPassword();
