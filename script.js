// Classes WoW pour le dropdown
const classesWOW = [
  'Chaman','Chasseur','Chasseur de démons','Chevalier de la Mort',
  'Démoniste','Druide','Guerrier','Mage','Moine','Paladin','Prêtre','Voleur'
];

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.card .content').forEach(content => {
    // Remplacer paragraphe Classe par dropdown
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

    // Niveau + et -
    const pLvl = content.querySelector('p[data-field="lvl"]');
    const lvlSpan = pLvl.querySelector('.level');
    const btnDownLvl = document.createElement('button');
    btnDownLvl.className = 'btn-increment'; btnDownLvl.textContent = '- Niveau';
    btnDownLvl.addEventListener('click', () => {
      let v = parseInt(lvlSpan.textContent, 10);
      if (v > 1) lvlSpan.textContent = v - 1;
    });
    const btnUpLvl = document.createElement('button');
    btnUpLvl.className = 'btn-increment'; btnUpLvl.textContent = '+ Niveau';
    btnUpLvl.addEventListener('click', () => {
      let v = parseInt(lvlSpan.textContent, 10);
      if (v < 60) lvlSpan.textContent = v + 1;
    });
    pLvl.after(btnDownLvl, btnUpLvl);

    // Mort +
    const pMorts = content.querySelector('p[data-field="morts"]');
    const mortSpan = pMorts.querySelector('.status');
    const btnMort = document.createElement('button');
    btnMort.className = 'btn-increment'; btnMort.textContent = '+ Mort';
    btnMort.addEventListener('click', () => {
      mortSpan.textContent = parseInt(mortSpan.textContent, 10) + 1;
    });
    pMorts.after(btnMort);
  });
});