// Classes WoW
const classesWOW = ['Chaman','Chasseur','Chasseur de démons','Chevalier de la Mort','Démoniste','Druide','Guerrier','Mage','Moine','Paladin','Prêtre','Voleur'];

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.card .content').forEach(initCard);
  document.getElementById('validateBtn').addEventListener('click', showSummary);
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

function showSummary() {
  const cont = document.getElementById('players-container');
  cont.innerHTML='';
  document.querySelectorAll('.card').forEach(card=>{
    const name=card.querySelector('header h2').textContent;
    const classe=card.querySelector('select').value;
    const lvl=card.querySelector('.level').textContent;
    const morts=card.querySelector('.status').textContent;
    const stream=card.querySelector('.btn-stream').href;

    const div=document.createElement('div'); div.className='player-line';
    div.innerHTML=`
      <span><strong>${name}</strong></span>
      <span>Classe : ${classe}</span>
      <span>Niveau : ${lvl}</span>
      <span>Morts : ${morts}</span>
      <a href="${stream}" target="_blank">Stream</a>
    `;
    cont.appendChild(div);
  });
}