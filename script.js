// ── Steps definition ─────────────────────────────────────────────
// Mirrors your original Python script's input() calls in order
const STEPS = [
  { key: 'length',  label: 'Enter length',           unit: 'mm' },
  { key: 'width',   label: 'Enter width',             unit: 'mm' },
  { key: 'height',  label: 'Enter height',            unit: 'mm' },
  { key: 'res',     label: 'Resin ratio part',        unit: 'parts' },
  { key: 'hard',    label: 'Hardener ratio part',     unit: 'parts' },
  { key: 'powder',  label: 'Powder percentage',       unit: '%' },
];

// ── State ─────────────────────────────────────────────────────────
let currentStep = 0;
let currentInput = '';
const values = {};

// ── DOM refs ──────────────────────────────────────────────────────
const displayValue  = document.getElementById('display-value');
const inputLabel    = document.getElementById('input-label');
const inputUnit     = document.getElementById('input-unit');
const screenInput   = document.getElementById('screen-input');
const screenResults = document.getElementById('screen-results');
const pips          = Array.from({ length: 6 }, (_, i) => document.getElementById(`pip-${i}`));

// ── Keypad handler ────────────────────────────────────────────────
document.querySelectorAll('.key').forEach(btn => {
  btn.addEventListener('click', () => handleKey(btn.dataset.val));
});

document.getElementById('btn-reset').addEventListener('click', reset);

// Keyboard support for desktop
document.addEventListener('keydown', e => {
  if (screenResults.classList.contains('active')) return;
  if (e.key >= '0' && e.key <= '9') handleKey(e.key);
  if (e.key === '.')        handleKey('.');
  if (e.key === 'Backspace') handleKey('clear');
  if (e.key === 'Enter')    handleKey('confirm');
});

// ── Key logic ─────────────────────────────────────────────────────
function handleKey(val) {
  if (val === 'clear') {
    currentInput = currentInput.slice(0, -1);
  } else if (val === 'confirm') {
    confirmStep();
    return;
  } else if (val === '.') {
    // Only one decimal point allowed
    if (!currentInput.includes('.')) {
      currentInput = currentInput === '' ? '0.' : currentInput + '.';
    }
  } else {
    // Prevent leading zeros unless followed by decimal, limit to 8 chars
    if (currentInput === '0') currentInput = val;
    else if (currentInput.length < 8) currentInput += val;
  }
  updateDisplay();
}

function updateDisplay() {
  displayValue.textContent = currentInput === '' ? '0' : currentInput;
}

// ── Step navigation ───────────────────────────────────────────────
function confirmStep() {
  const num = parseFloat(currentInput);
  if (!currentInput || currentInput === '0.' || isNaN(num) || num <= 0) {
    flashError();
    return;
  }

  values[STEPS[currentStep].key] = num;
  pips[currentStep].classList.remove('active');
  pips[currentStep].classList.add('done');
  currentStep++;

  if (currentStep >= STEPS.length) {
    showResults();
    return;
  }

  currentInput = '';
  updateDisplay();
  loadStep(currentStep);
}

function loadStep(i) {
  inputLabel.textContent = STEPS[i].label;
  inputUnit.textContent  = STEPS[i].unit;
  pips[i].classList.add('active');
}

function flashError() {
  displayValue.style.color = '#e06060';
  setTimeout(() => displayValue.style.color = '', 300);
}

// ── Calculation (mirrors your Python exactly) ─────────────────────
function showResults() {
  const { length, width, height, res, hard, powder } = values;

  const vol          = (length * width * height) / 1000;
  const mass         = vol * 1.15;
  const neededHard   = (hard * mass) / (res + hard);              // corrected formula
  const resinOnly    = mass - neededHard;
  const neededPowder = (powder / 100) * mass;

  // Populate result cards
  document.getElementById('res-vol').textContent    = vol.toFixed(2);
  document.getElementById('res-mass').textContent   = mass.toFixed(2);
  document.getElementById('res-resin').textContent  = resinOnly.toFixed(2);
  document.getElementById('res-hard').textContent   = neededHard.toFixed(2);
  document.getElementById('res-powder').textContent = neededPowder.toFixed(2);

  document.getElementById('results-ratio').innerHTML =
    `Resin&nbsp;&nbsp;&nbsp;${res} : ${hard}&nbsp;&nbsp;&nbsp;Hardener<br>` +
    `Powder&nbsp;&nbsp;${powder}% of total mass`;

  screenInput.classList.remove('active');
  screenResults.classList.add('active');
}

// ── Reset ─────────────────────────────────────────────────────────
function reset() {
  currentStep  = 0;
  currentInput = '';
  Object.keys(values).forEach(k => delete values[k]);

  pips.forEach(p => { p.classList.remove('active', 'done'); });

  screenResults.classList.remove('active');
  screenInput.classList.add('active');

  updateDisplay();
  loadStep(0);
}

// ── Init ──────────────────────────────────────────────────────────
loadStep(0);
