// script.js

// ====== ADMIN PASSWORD HASHED ======
const ADMIN_CREDENTIAL_HASH = '6686db6bfedd2373f4f0c4d477857dccdc6c09e8cdf42f7c272853290c415e44';
const ADMIN_WRITE_KEY = 'admin-2024-key';

async function sha256Hex(str) {
  const buf = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

const playersDefault = [
  { name: 'Aenot', classe: 'Rogue', lvl: 10, morts: 1, stream: 'https://twitch.tv/aenot', killcams: [] },
  { name: 'JLTomy', classe: 'Paladin', lvl: 14, morts: 0, stream: 'https://www.twitch.tv/jltomy', killcams: [] },
  { name: 'Fana', classe: 'Mage', lvl: 13, morts: 0, stream: 'https://www.twitch.tv/fana', killcams: [] },
  { name: 'Nikos', classe: 'Rogue', lvl: 7, morts: 2, stream: 'https://www.twitch.tv/nikos', killcams: [] },
  { name: 'Viggy_Night', classe: 'Chasseur', lvl: 5, morts: 3, stream: 'https://www.twitch.tv/viggy_night', killcams: [] },
  { name: 'FakeMonster', classe: 'Mage', lvl: 18, morts: 0, stream: 'https://www.twitch.tv/fakemonster', killcams: [] }
];

const isAdminPage = window.location.pathname.endsWith('admin.html');

window.addEventListener('DOMContentLoaded', () => {
  isAdminPage ? initAdmin() : initClient();
});

function initAdmin() {
  document.getElementById('btn-login').addEventListener('click', onLogin);
  document.getElementById('btn-save').addEventListener('click', onSave);
}

async function onLogin() {
  const u = document.getElementById('username').value.trim();
  const p = document.getElementById('password').value;
  const hash = await sha256Hex(`${u}:${p}`);
  if (hash === ADMIN_CREDENTIAL_HASH) {
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('editor').classList.remove('hidden');
    renderEditor();
  } else {
    document.getElementById('login-error').textContent = 'Identifiant ou mot de passe incorrect';
  }
}

function renderEditor() {
  const container = document.getElementById('edit-container');
  container.innerHTML = '';
  db.ref('wow_hc_players').once('value').then(snap => {
    const data = snap.val() || playersDefault;
    data.forEach((p, idx) => {
      const card = document.createElement('div');
      card.className = 'neon-card';
      card.dataset.index = idx;
      card.innerHTML = `
        <header><h2>${p.name}</h2></header>
        <label>Classe :</label>
        <select data-field="classe"></select>
        <label>Niveau :</label>
        <input type="number" data-field="lvl" min="1" max="60" value="${p.lvl}">
        <label>Morts :</label>
        <input type="number" data-field="morts" min="0" value="${p.morts}">
        <label>Stream :</label>
        <input type="url" data-field="stream" value="${p.stream}">
        <label>Killcams :</label>
        <div class="killcam-inputs"></div>
        <button type="button" class="neon-btn small add-killcam">+ Ajouter Killcam</button>
      `;
      ['Rogue','Paladin','Mage','Chasseur','Druid','Warlock']
        .forEach(cl => card.querySelector('select').add(new Option(cl, cl)));
      card.querySelector('select').value = p.classe;
      const kcContainer = card.querySelector('.killcam-inputs');
      (p.killcams || []).forEach(url => addKillcamInput(kcContainer, url));
      card.querySelector('.add-killcam').addEventListener('click', () => addKillcamInput(kcContainer));
      container.appendChild(card);
    });
  });
}

function addKillcamInput(container, url = '') {
  const wrapper = document.createElement('div');
  wrapper.style.display = 'flex';
  wrapper.style.alignItems = 'center';
  wrapper.style.marginBottom = '0.5rem';
  const input = document.createElement('input');
  input.type = 'url';
  input.dataset.field = 'killcams';
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
  container.appendChild(wrapper);
}

async function onSave() {
  const user = firebase.auth().currentUser;
  if (!user) {
    alert("Vous devez être connecté pour enregistrer.");
    return;
  }

  const data = Array.from(document.querySelectorAll('#edit-container .neon-card')).map(card => {
    return {
      name: card.querySelector('h2').textContent,
      classe: card.querySelector('select[data-field="classe"]').value,
      lvl: +card.querySelector('input[data-field="lvl"]').value,
      morts: +card.querySelector('input[data-field="morts"]').value,
      stream: card.querySelector('input[data-field="stream"]').value.trim(),
      killcams: Array.from(card.querySelectorAll('input[data-field=\"killcams\"]'))
        .map(input => input.value.trim())
        .filter(url => url !== '')
    };
  });

  await db.ref('wow_hc_players').set(data);
  window.location.href = 'index.html';
}

function initClient() {
  document.getElementById('btn-admin')?.addEventListener('click', () => window.location.href = 'admin.html');
  db.ref('wow_hc_players').on('value', snapshot => {
    const data = snapshot.val() || playersDefault;
    displayPlayers(data);
    displayLevelLeaderboard(data);
    displayDeathsLeaderboard(data);
    displayKillcams(data);
  });
}

function displayPlayers(data) {
  const c = document.getElementById('players-container');
  if (!c) return;
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
  const el = document.getElementById('leaderboard-deaths');
  if (el) {
    el.innerHTML = '<h2>Classement Morts</h2><ol>' +
      sorted.map(p => `<li>${p.name} : ${p.morts} morts</li>`).join('') + '</ol>';
  }
}

function displayLevelLeaderboard(data) {
  const sorted = [...data].sort((a, b) => b.lvl - a.lvl);
  const el = document.getElementById('leaderboard-levels');
  if (el) {
    el.innerHTML = '<h2>Classement Niveaux</h2><ol>' +
      sorted.map(p => `<li>${p.name} : lvl ${p.lvl}</li>`).join('') + '</ol>';
  }
}

function displayKillcams(data) {
  const ul = document.getElementById('killcam-list');
  if (!ul) return;
  ul.innerHTML = data.filter(p => p.killcams?.length)
    .map(p => {
      const links = p.killcams.map(url => `<a href="${url}" target="_blank">${url}</a>`).join('<br>');
      return `<li><strong>${p.name}</strong><br>${links}</li>`;
    }).join('');
}
