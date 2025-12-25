// Calculator logic with preview and uniform buttons
const previewEl = document.getElementById('preview');
const displayEl = document.getElementById('display');
const buttons = document.querySelector('.buttons');
let expr = '';

function updateDisplay(){
  // preview shows full expression
  previewEl.textContent = expr || '';

  // main display shows the current number being entered (last numeric token), or result
  if (!expr) {
    displayEl.textContent = '0';
    return;
  }
  const lastNum = expr.match(/(\d+\.?\d*)$/);
  if (lastNum) {
    displayEl.textContent = lastNum[0];
  } else {
    // if expression ends with operator, show the operator
    displayEl.textContent = expr.slice(-1) || '0';
  }
}

function appendValue(val){
  const last = expr.slice(-1);
  const operators = '+-*/%';

  if (val === '.'){
    // prevent multiple dots in same number
    const m = expr.match(/(\d+\.?\d*)$/);
    if (m && m[0].includes('.')) return;
    if (!m) expr += '0';
    expr += '.';
    return;
  }

  if (operators.includes(val)){
    if (!expr) {
      if (val === '-') { expr = '-'; } // allow negative start
      return;
    }
    if (operators.includes(last)){
      // replace last operator with new one
      expr = expr.slice(0,-1) + val;
      return;
    }
    expr += val;
    return;
  }

  // digits
  expr += val;
}

function safeEvaluate(s){
  // allow digits, operators, parentheses and dot (percent handled before eval)
  if (!/^[0-9+\-*/().\s]+$/.test(s)) throw new Error('Invalid characters');
  // evaluate in strict mode
  // eslint-disable-next-line no-new-func
  return Function('"use strict";return ('+s+')')();
}

function doEquals(){
  if (!expr) return;
  try{
    // show the expression in preview with equals
    previewEl.textContent = expr + ' =';
    // preprocess percent-of patterns like `a%b` -> `(a/100)*b`
    let toEval = expr;
    const percentRegex = /(\d+(?:\.\d*)?)\s*%\s*(\d+(?:\.\d*)?)/g;
    toEval = toEval.replace(percentRegex, '($1/100)*$2');
    const res = safeEvaluate(toEval);
    expr = String(res);
    displayEl.textContent = expr;
  }catch(e){
    displayEl.textContent = 'Error';
    expr = '';
    setTimeout(updateDisplay,800);
  }
}

buttons.addEventListener('click', e =>{
  const btn = e.target.closest('button');
  if (!btn) return;
  const val = btn.dataset.value;
  const action = btn.dataset.action;

  if (action === 'clear'){
    expr = '';
    updateDisplay();
    return;
  }
  if (action === 'back'){
    expr = expr.slice(0,-1);
    updateDisplay();
    return;
  }
  if (action === 'equals'){
    doEquals();
    return;
  }
  if (val !== undefined){
    appendValue(val);
    updateDisplay();
  }
});

// keyboard support
document.addEventListener('keydown', e =>{
  const key = e.key;
  if ((/^[0-9]$/).test(key)) { appendValue(key); updateDisplay(); return; }
  if (key === '.') { appendValue('.'); updateDisplay(); return; }
  if (key === '%') { appendValue('%'); updateDisplay(); return; }
  if (key === 'Enter' || key === '=') { doEquals(); return; }
  if (key === 'Backspace') { expr = expr.slice(0,-1); updateDisplay(); return; }
  if (key === 'Escape') { expr = ''; updateDisplay(); return; }
  if ('+-*/'.includes(key)){ appendValue(key); updateDisplay(); return; }
});

updateDisplay();
