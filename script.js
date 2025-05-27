// script.js

// ====== ADMIN CONFIG ======
const ADMIN_USER = 'WowJL2025';
const ADMIN_PASS = 'Z@5nW8%uF2kL#pR1';

// ====== DONNÉES PAR DÉFAUT ======
const playersDefault = [
  { name:'Aenot',       classe:'Rogue',   lvl:10, morts:1, stream:'https://www.twitch.tv/aenot',       killcam:'' },
  { name:'JLTomy',      classe:'Paladin', lvl:14, morts:0, stream:'https://www.twitch.tv/jltomy',      killcam:'' },
  { name:'Fana',        classe:'Mage',    lvl:13, morts:0, stream:'https://www.twitch.tv/fana',        killcam:'' },
  { name:'Nikos',       classe:'Rogue',   lvl:7,  morts:2, stream:'https://www.twitch.tv/nikos',       killcam:'' },
  { name:'Viggy_Night', classe:'Chasseur',lvl:5,  morts:3, stream:'https://www.twitch.tv/viggy_night',killcam:'' },
  { name:'FakeMonster', classe:'Mage',    lvl:18, morts:0, stream:'https://www.twitch.tv/Fakemonster', killcam:'' }
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
      window.location.href = 'index.html';
    });
}

function renderEditor(){
  const container = document.getElementById('edit-container');
  container.innerHTML = '';
  getStoredData().forEach(p => {
    const card = document.createElement('div');
    card.className = 'neon-card';
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
      <label>Ajout de Killcam:
        <input type="url" data-field="killcam" placeholder="https://... " value="${p.killcam}">
      </label>
    `;
    // Remplir la select
    ['Rogue','Paladin','Mage','Chasseur','Druid','Warlock']
      .forEach(c => card.querySelector('select').add(new Option(c, c)));
    card.querySelector('select').value = p.classe;
    container.append(card);
  });
}

function saveData(){
  const cards = document.querySelectorAll('#edit-container .neon-card');
  const data = Array.from(cards).map(card => {
    const name   = card.querySelector('h2').textContent;
    const fields = card.querySelectorAll('[data-field]');
    const obj = { name };
    fields.forEach(el => {
      const key = el.getAttribute('data-field');
      const val = el.value;
      obj[key] = (key === 'lvl' || key === 'morts') ? +val : val;
    });
    // conserver le stream d'origine
    obj.stream = playersDefault.find(x => x.name === name).stream;
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
    .filter(p => p.killcam)
    .map(p => `<li>${p.name}: <a href="${p.killcam}" target="_blank">${p.killcam}</a></li>`)
    .join('');
}
