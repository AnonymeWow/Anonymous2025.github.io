// ====== ADMIN CONFIG ======
const ADMIN_USER = 'WowJL2025';
const ADMIN_PASS = 'Z@5nW8%uF2kL#pR1';

// ====== DONNÉES PAR DÉFAUT ======
const playersDefault = [
  { name:'Aenot',       classe:'Rogue',   lvl:10, morts:1, stream:'https://www.twitch.tv/aenot',       killcams: [] },
  { name:'JLTomy',      classe:'Paladin', lvl:14, morts:0, stream:'https://www.twitch.tv/jltomy',      killcams: [] },
  { name:'Fana',        classe:'Mage',    lvl:13, morts:0, stream:'https://www.twitch.tv/fana',        killcams: [] },
  { name:'Nikos',       classe:'Rogue',   lvl:7,  morts:2, stream:'https://www.twitch.tv/nikos',       killcams: [] },
  { name:'Viggy_Night', classe:'Chasseur',lvl:5,  morts:3, stream:'https://www.twitch.tv/viggy_night',killcams: [] },
  { name:'FakeMonster', classe:'Mage',    lvl:18, morts:0, stream:'https://www.twitch.tv/Fakemonster', killcams: [] }
];

// ====== INIT ======
window.addEventListener('DOMContentLoaded', () => {
  const page = location.pathname.split('/').pop();
  if (page === 'admin.html') initAdmin();
  else initClient();
});

// ====== ADMIN ======
function initAdmin(){
  document.getElementById('btn-login')
    .addEventListener('click', () => {
      const u = document.getElementById('username').value;
      const p = document.getElementById('password').value;
      if (u === ADMIN_USER && p === ADMIN_PASS) {
        document.getElementById('login-form').classList.add('hidden');
        document.getElementById('editor').classList.remove('hidden');
        renderEditor();
      } else {
        document.getElementById('login-error').textContent = 'Erreur de connexion';
      }
    });

  document.getElementById('btn-save')
    .addEventListener('click', () => {
      saveData();
      window.location.href = 'client.html';
    });
}

function renderEditor(){
  const container = document.getElementById('edit-container');
  container.innerHTML = '';

  getStoredData().forEach(p => {
    const card = document.createElement('div');
    card.className = 'neon-card';

    // Zone killcams dynamique
    const kcContainer = document.createElement('div');
    kcContainer.className = 'killcam-inputs';
    (p.killcams || []).forEach(url => {
      const inp = document.createElement('input');
      inp.type = 'url';
      inp.placeholder = 'https://...';
      inp.value = url;
      inp.setAttribute('data-field', 'killcams');
      kcContainer.appendChild(inp);
    });

    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.textContent = '+ Ajouter Killcam';
    addBtn.className = 'btn neon-btn small';
    addBtn.addEventListener('click', () => {
      const newInp = document.createElement('input');
      newInp.type = 'url';
      newInp.placeholder = 'https://...';
      newInp.setAttribute('data-field', 'killcams');
      kcContainer.appendChild(newInp);
    });

    card.innerHTML = `
      <header><h2>${p.name}</h2></header>
      <label>Classe:
        <select data-field="classe"></select>
      </label>
      <label>Niveau:
        <input type="number" data-field="lvl" min="1" max="60" value="${p.lvl}">
      </label>
      <label>Morts:
        <input type="number" data-field="morts" min="0" value="${p.morts}">
      </label>
      <label>Stream:
        <input type="url" data-field="stream" value="${p.stream}">
      </label>
      <label>Killcams:</label>
    `;
    // remplir la select
    const sel = card.querySelector('select');
    ['Rogue','Paladin','Mage','Chasseur','Druid','Warlock']
      .forEach(c => sel.add(new Option(c, c)));
    sel.value = p.classe;

    card.appendChild(kcContainer);
    card.appendChild(addBtn);
    container.appendChild(card);
  });
}

function saveData(){
  const cards = document.querySelectorAll('#edit-container .neon-card');
  const data = Array.from(cards).map(card => {
    const name   = card.querySelector('h2').textContent;
    const obj = { name, killcams: [] };
    card.querySelectorAll('[data-field]').forEach(el => {
      const key = el.getAttribute('data-field');
      if (key === 'killcams') {
        // nulle valeur ignorée
        if (el.value.trim()) obj.killcams.push(el.value.trim());
      } else if (key === 'lvl' || key === 'morts') {
        obj[key] = +el.value;
      } else {
        obj[key] = el.value;
      }
    });
    // conserver le stream s'il n'a pas été changé
    if (!obj.stream) {
      obj.stream = playersDefault.find(x => x.name === name).stream;
    }
    return obj;
  });
  localStorage.setItem('wow_hc_players', JSON.stringify(data));
}

// ====== CLIENT ======
function initClient(){
  const data = getStoredData();
  displayPlayers(data);
  displayDeathsLeaderboard(data);
  displayLevelLeaderboard(data);
  displayKillcams(data);
  document.getElementById('btn-admin')
    .addEventListener('click', () => window.location.href = 'admin.html');
}

function getStoredData(){
  const s = localStorage.getItem('wow_hc_players');
  return s ? JSON.parse(s) : playersDefault;
}

function displayPlayers(data){
  const c = document.getElementById('players-container');
  c.innerHTML = data.map(p => `
    <div class="neon-card">
      <h3>${p.name}</h3>
      <p>${p.classe}</p>
      <p>lvl ${p.lvl} • ${p.morts} morts</p>
      <a href="${p.stream}" target="_blank">Live</a>
    </div>
  `).join('');
}

function displayDeathsLeaderboard(data){
  const sorted = [...data].sort((a,b) => a.morts - b.morts);
  document.getElementById('leaderboard-deaths').innerHTML =
    '<h2>Classement Morts</h2><ol>' +
    sorted.map(p => `<li>${p.name}<span>${p.morts} morts</span></li>`).join('') +
    '</ol>';
}

function displayLevelLeaderboard(data){
  const sorted = [...data].sort((a,b) => b.lvl - a.lvl);
  document.getElementById('leaderboard-levels').innerHTML =
    '<h2>Classement Niveaux</h2><ol>' +
    sorted.map(p => `<li>${p.name}<span>lvl ${p.lvl}</span></li>`).join('') +
    '</ol>';
}

function displayKillcams(data){
  const ul = document.getElementById('killcam-list');
  ul.innerHTML = data
    .flatMap(p => (p.killcams || []).map(url => ({ name: p.name, url })))
    .map(item => `<li>${item.name}: <a href="${item.url}" target="_blank">${item.url}</a></li>`)
    .join('');
}
