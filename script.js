const classesWOW = ['Chaman','Chasseur','Chasseur de démons','Chevalier de la Mort','Démoniste','Druide','Guerrier','Mage','Moine','Paladin','Prêtre','Voleur'];

document.addEventListener('DOMContentLoaded', () => {
  const contents = document.querySelectorAll('.card .content');
  contents.forEach(initCard);

  // Validation
  document.getElementById('validateBtn').addEventListener('click', showSummary);
});

function initCard(content) {
  // Classe
  const pClasse = content.querySelector('p[data-field="classe"]');
  const initialClasse = pClasse.textContent.split(':')[1].trim();
  const lblClasse = document.createElement('label'); lblClasse.textContent = 'Classe :';
  const select = document.createElement('select');
  classesWOW.forEach(cl => {
    const opt = new Option(cl, cl);
    if (cl === initialClasse) opt.selected = true;
    select.add(opt);
  });
  pClasse.replaceWith(lblClasse, select);

  // Niveau
  const pLvl = content.querySelector('p[data-field="lvl"]');
  const lvlSpan = pLvl.querySelector('.level');
  const btnDownLvl = makeBtn('- Niveau', () => updateSpan(lvlSpan, -1, 1, 60));
  const btnUpLvl   = makeBtn('+ Niveau', () => updateSpan(lvlSpan, +1, 1, 60));
  pLvl.after(btnDownLvl, btnUpLvl);

  // Morts
  const pMorts = content.querySelector('p[data-field="morts"]');
  const mortSpan = pMorts.querySelector('.status');
  const btnMort  = makeBtn('+ Mort', () => updateSpan(mortSpan, +1, 0));
  pMorts.after(btnMort);
}

function makeBtn(text, cb) {
  const btn = document.createElement('button');
  btn.className = 'btn-increment'; btn.textContent = text; btn.addEventListener('click', cb);
  return btn;
}

function updateSpan(span, delta, min=0, max=Infinity) {
  let v = parseInt(span.textContent, 10) + delta;
  if (v < min) v = min;
  if (v > max) v = max;
  span.textContent = v;
}

function showSummary() {
  const summary = document.getElementById('summary');
  summary.innerHTML = '';
  document.querySelectorAll('.card').forEach(card => {
    const name = card.querySelector('header h2').textContent;
    const classe = card.querySelector('select').value;
    const lvl = card.querySelector('.level').textContent;
    const morts = card.querySelector('.status').textContent;

    const div = card.cloneNode(false);
    div.classList.add('summary-card');
    div.innerHTML = `
      <header><h2>${name}</h2></header>
      <div class="content">
        <p><strong>Classe :</strong> ${classe}</p>
        <p><strong>Niveau :</strong> ${lvl}</p>
        <p><strong>Mort :</strong> ${morts}</p>
      </div>
    `;
    summary.appendChild(div);
  });
}