// script.js

// ====== ADMIN CONFIG ======
const ADMIN_USER = 'WowJL2025';
const ADMIN_PASS = 'Z@5nW8%uF2kL#pR1';

// ====== DONNÉES PAR DÉFAUT ======
const playersDefault = [
  { name: 'Aenot', classe: 'Rogue', lvl: 10, morts: 1, stream: 'https://twitch.tv/aenot', killcams: [] },
  { name: 'JLTomy',      classe: 'Paladin', lvl: 14, morts: 0, stream: 'https://www.twitch.tv/jltomy', killcams: [] },
  { name: 'Fana',        classe: 'Mage',    lvl: 13, morts: 0, stream: 'https://www.twitch.tv/fana', killcams: [] },
  { name: 'Nikos',       classe: 'Rogue',   lvl: 7,  morts: 2, stream: 'https://www.twitch.tv/nikos', killcams: [] },
  { name: 'Viggy_Night', classe: 'Chasseur',lvl: 5,  morts: 3, stream: 'https://www.twitch.tv/viggy_night', killcams: [] },
  { name: 'FakeMonster', classe: 'Mage',    lvl: 18, morts: 0, stream: 'https://www.twitch.tv/fakemonster', killcams: [] }
];

// ====== INIT ======
window.addEventListener('DOMContentLoaded', () => {
  const page = location.pathname.split('/').pop();
  if (page === 'admin.html') initAdmin();
  else initClient();
});

// ====== ADMIN ======
function initAdmin() {
  document.getElementById('btn-login').addEventListener('click', () => {
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

  document.getElementById('btn-save').addEventListener('click', () => {
    saveData();
    window.location.href = 'index.html';
  });
}

// Crée la vue d'édition pour chaque joueur
function renderEditor() {
  const container = document.getElementById('edit-container');
  container.innerHTML = '';
  const data = getStoredData();

  data.forEach(p => {
    const card = document.createElement('div');
    card.className = 'neon-card';
    card.innerHTML = `
      <header><h2>${p.name}</h2></header>
      <label>Classe :</label>
      <select data-field="classe"></select>
      <label>Niveau :</label>
      <input type="number" data-field="lvl" min="1" max="60" value="${p.lvl}">
      <label>Morts :</label>
      <input type="number" data-field="morts" min="0" value="${p.morts}">
      <label>Killcams :</label>
      <div class="killcam-inputs"></div>
      <button class="neon-btn small add-killcam">+ Ajouter Killcam</button>
    `;

    // Remplir la liste déroulante des classes
    ['Rogue','Paladin','Mage','Chasseur','Druid','Warlock'].forEach(cl => {
      card.querySelector('select').add(new Option(cl, cl));
    });
    card.querySelector('select').value = p.classe;

    // Conteneur pour les inputs Killcam
    const kcContainer = card.querySelector('.killcam-inputs');

    // Fonction utilitaire pour ajouter un champ Killcam avec bouton de suppression
    function addKillcamInput(url = '') {
      const wrapper = document.createElement('div');
      wrapper.style.display = 'flex';
      wrapper.style.alignItems = 'center';
      wrapper.style.marginBottom = '0.5rem';

      const input = document.createElement('input');
      input.type = 'url';
      input.setAttribute('data-field', 'killcams');
      input.value = url;
      input.placeholder = 'https://...';
      input.style.flex = '1';
      input.style.marginRight = '0.5rem';

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = '×';
      btn.className = 'neon-btn small';
      btn.style.padding = '0.2rem 0.6rem';
      btn.addEventListener('click', () => wrapper.remove());

      wrapper.append(input, btn);
      kcContainer.appendChild(wrapper);
    }

    // Créer les champs existants
    (p.killcams || []).forEach(url => addKillcamInput(url));

    // Bouton pour en ajouter
    card.querySelector('.add-killcam').addEventListener('click', () => {
      addKillcamInput();
    });

    container.appendChild(card);
  });
}

// Enregistre toutes les modifications
function saveData() {
  const stored = getStoredData();
  const cards = document.querySelectorAll('#edit-container .neon-card');

  cards.forEach(card => {
    const name   = card.querySelector('h2').textContent;
    const player = stored.find(p => p.name === name);

    // Mettre à jour les champs simples
    player.classe = card.querySelector('select').value;
    player.lvl    = +card.querySelector('input[data-field="lvl"]').value;
    player.morts  = +card.querySelector('input[data-field="morts"]').value;

    // Reconstituer le tableau killcams
    player.killcams = [];
    card.querySelectorAll('input[data-field="killcams"]').forEach(el => {
      const val = el.value.trim();
      if (val) player.killcams.push(val);
      else if (key === 'stream') {
      player[key] = val;
    }
    });
  });

  localStorage.setItem('wow_hc_players', JSON.stringify(stored));
}

// ====== CLIENT ======
function initClient() {
  const data = getStoredData();
  displayPlayers(data);
  displayDeathsLeaderboard(data);
  displayLevelLeaderboard(data);
  displayKillcams(data);
  document.getElementById('btn-admin')
    .addEventListener('click', () => window.location.href = 'admin.html');
}

function getStoredData() {
  const s = localStorage.getItem('wow_hc_players');
  return s ? JSON.parse(s) : playersDefault;
}

function displayPlayers(data) {
  const c = document.getElementById('players-container');
  c.innerHTML = data.map(p => `
    <div class="neon-card">
      <h3>${p.name}</h3>
      <p>${p.classe}</p>
      <p>lvl ${p.lvl} • ${p.morts} morts</p>
      ${p.stream ? `<a href="${p.stream}" target="_blank" class="stream-link">Live</a>` : ''}
    </div>
  `).join('');
}

function displayDeathsLeaderboard(data) {
  const sorted = [...data].sort((a, b) => b.morts - a.morts);
  document.getElementById('leaderboard-deaths').innerHTML =
    '<h2>Classement Morts</h2><ol>' +
    sorted.map(p => `<li>${p.name}<span> : ${p.morts} morts</span></li>`).join('') +
    '</ol>';
}

function displayLevelLeaderboard(data) {
  const sorted = [...data].sort((a, b) => b.lvl - a.lvl);
  document.getElementById('leaderboard-levels').innerHTML =
    '<h2>Classement Niveaux</h2><ol>' +
    sorted.map(p => `<li>${p.name}<span> : lvl ${p.lvl}</span></li>`).join('') +
    '</ol>';
}

function displayKillcams(data) {
  const ul = document.getElementById('killcam-list');
  ul.innerHTML = data
    .filter(p => p.killcams && p.killcams.length)
    .map(p => {
      const links = p.killcams
        .map(url => `<a href="${url}" target="_blank">${url}</a>`)
        .join('<br>');
      return `<li><strong>${p.name}</strong><br>${links}</li>`;
    })
    .join('');
}
