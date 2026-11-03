const QUESTIONS = [
  { id: 'farniente', icon: '☀', image: 'images/farniente.png', name: 'Farniente & eaux turquoise', blurb: 'La parenthèse pieds nus, entre plage, hamac et baignades.', places: ['Holbox', 'Club Med Cancún', 'Isla Mujeres'], palette: 'coral' },
  { id: 'marine', icon: '◌', image: 'images/marine.png', name: 'Fonds marins', blurb: 'Masque sur le nez, pour découvrir le monde qui vit sous l’eau.', places: ['Cozumel', 'Isla Mujeres', 'Playa del Carmen'], palette: 'blue' },
  { id: 'nature', icon: '❋', image: 'images/nature.png', name: 'Nature & cenotes', blurb: 'Oiseaux roses, mangroves, jungle et plongeons dans les cénotes.', places: ['Celestún', 'Río Lagartos', 'Sian Ka’an', 'Cénotes'], palette: 'green' },
  { id: 'archaeology', icon: '⌂', image: 'images/archaeology.png', name: 'Cités mayas', blurb: 'Des pierres chargées d’histoire, perdues dans la végétation.', places: ['Ek’ Balam', 'Tulum', 'Uxmal', 'Edzná', 'Cobá', 'Dzibilchaltún'], palette: 'ochre' },
  { id: 'colonial', icon: '✣', image: 'images/colonial.png', name: 'Villes & haciendas', blurb: 'Façades pastel, marchés, patios frais et belles adresses.', places: ['Anciennes haciendas', 'Mérida', 'Valladolid', 'Campeche'], palette: 'pink' }
];

const LEVELS = [
  ['none', 'Pas du tout', '○'],
  ['little', 'Un peu', '◔'],
  ['much', 'Beaucoup', '◕'],
  ['passion', 'Passionnément', '✦']
];
const names = { 'marie-jo': 'Marie-Jo', tabeth: 'Tabeth' };
let token = sessionStorage.getItem('yucatan_token');
let role = sessionStorage.getItem('yucatan_role');
let answers = {};

const byId = (id) => document.getElementById(id);
const show = (id) => byId(id).classList.remove('hidden');
const hide = (id) => byId(id).classList.add('hidden');

async function api(path, options = {}) {
  const response = await fetch(path, { ...options, headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}), ...(options.headers || {}) } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Un problème est survenu.');
  return data;
}

function renderSurvey() {
  byId('voter-name').textContent = `, ${names[role]}`;
  byId('survey-form').innerHTML = QUESTIONS.map((q, index) => `
    <article class="question-card ${q.palette}">
      <div class="card-art" aria-hidden="true"><img src="${q.image}" alt="" ${index === 0 ? 'fetchpriority="high"' : 'loading="lazy"'}><span>${q.icon}</span></div>
      <div class="question-body">
        <p class="number">0${index + 1}</p><h2>${q.name}</h2><p class="blurb">${q.blurb}</p>
        <p class="places">${q.places.map((place) => `<span>${place}</span>`).join('')}</p>
        <fieldset class="vote-row"><legend>Votre envie</legend>${LEVELS.map(([value, label, mark]) => `
          <label class="vote-option"><input type="radio" name="${q.id}" value="${value}" ${answers[q.id] === value ? 'checked' : ''}><span class="vote-mark">${mark}</span><span>${label}</span></label>`).join('')}
        </fieldset>
      </div>
    </article>`).join('');
  byId('survey-form').addEventListener('change', onVote);
  updateSaveState();
}

function onVote(event) { if (event.target.matches('input[type=radio]')) { answers[event.target.name] = event.target.value; updateSaveState(); } }
function updateSaveState() {
  const ready = QUESTIONS.every((q) => answers[q.id]);
  byId('save-button').disabled = !ready;
  const remaining = QUESTIONS.length - Object.keys(answers).length;
  byId('save-status').textContent = ready ? 'Tout est prêt : vous pouvez enregistrer.' : `Encore ${remaining} univers à choisir avant l’enregistrement.`;
}

async function startSurvey() {
  hide('login-view'); hide('results-view'); show('survey-view');
  try { answers = (await api('/api/responses')).answers || {}; } catch (error) { answers = {}; }
  renderSurvey();
}

function levelCell(answer) {
  const level = LEVELS.find(([id]) => id === answer);
  return level ? `<span class="result-level level-${answer}"><b>${level[2]}</b>${level[1]}</span>` : '<span class="pending">En attente</span>';
}

async function startResults() {
  hide('login-view'); hide('survey-view'); show('results-view');
  const area = byId('results-content'); area.innerHTML = '<p class="loading">Chargement des réponses…</p>';
  try {
    const data = await api('/api/results');
    const responseMap = Object.fromEntries(data.responses.map((item) => [item.respondent, item]));
    area.innerHTML = `<div class="legend">${LEVELS.map(([, label, mark]) => `<span>${mark} ${label}</span>`).join('')}</div><div class="result-table"><div class="result-head"><span>Univers</span><span>Marie-Jo</span><span>Tabeth</span></div>${QUESTIONS.map((q) => `<div class="result-row"><span class="result-category"><i class="mini ${q.palette}">${q.icon}</i>${q.name}</span><span>${levelCell(responseMap['marie-jo']?.answers?.[q.id])}</span><span>${levelCell(responseMap.tabeth?.answers?.[q.id])}</span></div>`).join('')}</div><p class="updated-note">Les résultats se mettent à jour à chaque enregistrement.</p>`;
  } catch (error) { area.innerHTML = `<p class="error-box">${error.message}</p>`; }
}

function signOut() { sessionStorage.removeItem('yucatan_token'); sessionStorage.removeItem('yucatan_role'); token = null; role = null; answers = {}; hide('survey-view'); hide('results-view'); show('login-view'); byId('access-code').value = ''; }

byId('login-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = event.currentTarget.querySelector('button'); const error = byId('login-error');
  button.disabled = true; error.textContent = '';
  try {
    const data = await api('/api/session', { method: 'POST', body: JSON.stringify({ code: byId('access-code').value }) });
    token = data.token;
    const payload = JSON.parse(atob(token.split('.')[0].replace(/-/g, '+').replace(/_/g, '/')));
    role = payload.role; sessionStorage.setItem('yucatan_token', token); sessionStorage.setItem('yucatan_role', role);
    role === 'organizer' ? await startResults() : await startSurvey();
  } catch (reason) { error.textContent = reason.message; }
  finally { button.disabled = false; }
});

byId('save-button').addEventListener('click', async () => {
  const button = byId('save-button'); const status = byId('save-status'); button.disabled = true; status.textContent = 'Enregistrement…';
  try { await api('/api/responses', { method: 'POST', body: JSON.stringify({ answers }) }); status.textContent = 'Enregistré — merci ✦'; }
  catch (error) { status.textContent = error.message; }
  finally { button.disabled = false; }
});
byId('logout').addEventListener('click', signOut);
byId('organizer-logout').addEventListener('click', signOut);
if (token && role) role === 'organizer' ? startResults() : startSurvey();
