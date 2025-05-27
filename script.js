// Classes WoW
const classesWOW = ['Chaman','Chasseur','Chasseur de démons','Chevalier de la Mort','Démoniste','Druide','Guerrier','Mage','Moine','Paladin','Prêtre','Voleur'];

document.addEventListener('DOMContentLoaded', () => {
  // Initialisation des cartes statiques
  document.querySelectorAll('.card .content').forEach(initCard);
  // Validation
  document.getElementById('validateBtn').addEventListener('click', () => {
    showSummary();
    showLeaderboard();
  });
});

function initCard(content) {
  // Classe dropdown
  const pClasse = content.querySelector('p[data-field="classe"]');
  const initCl = pClasse.textContent.split(':')[1].trim();
  const lblC = document.createElement('label'); lblC.textContent = 'Classe :';
  const sel = document.createElement('select');
  classesWOW.forEach(cl => { const o=new Option(cl,cl); if(cl===initCl) o.selected=true; sel.add(o); });
  pClasse.replaceWith(lblC, sel);

  // Niveau +/-
  const pLvl = content.querySelector('p[data-field="lvl"]');
  const lvlSpan = pLvl.querySelector('.level');
  const btnDown = makeBtn('- Niveau', ()=>updateSpan(lvlSpan,-1,1,60));
  const btnUp   = makeBtn('+ Niveau', ()=>updateSpan(lvlSpan,+1,1,60));
  pLvl.after(btnDown, btnUp);

  // Mort +
  const pM = content.querySelector('p[data-field="morts"]');
  const mSpan = pM.querySelector('.status');
  const btnM = makeBtn('+ Mort', ()=>updateSpan(mSpan,+1,0));
  pM.after(btnM);
}

function makeBtn(text, cb) {
  const b=document.createElement('button'); b.className='btn-increment'; b.textContent=text; b.addEventListener('click',cb); return b;
}

function updateSpan(span, delta, min=0, max=Infinity) {
  let v= parseInt(span.textContent,10)+delta; if(v<min) v=min; if(v>max) v=max; span.textContent=v;
}

function gatherData() {
  const data = [];
  document.querySelectorAll('.card').forEach(card => {
    const name = card.querySelector('header h2').textContent;
    const classe = card.querySelector('select').value;
    const lvl = parseInt(card.querySelector('.level').textContent,10);
    const morts = parseInt(card.querySelector('.status').textContent,10);
    const stream = card.querySelector('.btn-stream').href;
    data.push({ name, classe, lvl, morts, stream });
  });
  return data;
}

function showSummary() {
  const cont = document.getElementById('players-container');
  cont.innerHTML='';
  gatherData().forEach(p => {
    const div = document.createElement('div'); div.className='player-line';
    div.innerHTML = `
      <span><strong>${p.name}</strong></span>
      <span>Classe : ${p.classe}</span>
      <span>Niveau : ${p.lvl}</span>
      <span>Morts : ${p.morts}</span>
      <a href="${p.stream}" target="_blank">Stream</a>
    `;
    cont.appendChild(div);
  });
}

function showLeaderboard() {
  const lb = document.getElementById('leaderboard');
  lb.innerHTML = '';
  const data = gatherData();

  // Classement morts
  const byDeaths = [...data].sort((a,b) => b.morts - a.morts);
  lb.append(createTableSection('Classement par Morts', byDeaths, 'morts'));

  // Classement niveau
  const byLevel = [...data].sort((a,b) => b.lvl - a.lvl);
  lb.append(createTableSection('Classement par Niveau', byLevel, 'lvl'));
}

function createTableSection(title, data, key) {
  const section = document.createElement('div');
  const h3 = document.createElement('h3'); h3.textContent = title;
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  thead.innerHTML = '<tr><th>Rang</th><th>Nom</th><th>' + (key === 'morts' ? 'Morts' : 'Niveau') + '</th></tr>';
  const tbody = document.createElement('tbody');
  data.forEach((p,i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${i+1}</td><td>${p.name}</td><td>${p[key]}</td>`;
    tbody.appendChild(tr);
  });
  table.append(thead, tbody);
  section.append(h3, table);
  return section;
}