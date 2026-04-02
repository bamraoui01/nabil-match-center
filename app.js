const matchesEl = document.getElementById('matches');
const bigGamesEl = document.getElementById('bigGames');
const rajaPanelEl = document.getElementById('rajaPanel');
const featuredSublineEl = document.getElementById('featuredSubline');

const fallbackMatches = [
  {home:'Raja Casablanca', away:'Wydad', score:'2 - 1', minute:"68'", status:'LIVE', comp:'Botola Pro'},
  {home:'PSG', away:'Marseille', score:'1 - 0', minute:"42'", status:'LIVE', comp:'Ligue 1'},
  {home:'Real Madrid', away:'Barça', score:'3 - 2', minute:'FT', status:'FT', comp:'La Liga'},
  {home:'Man City', away:'Liverpool', score:'19:30', minute:'Soon', status:'SOON', comp:'Premier League'}
];

const bigGames = [
  {title:'Raja Casablanca Zone', info:'Focus club favori • ambiance Raja • grand écran match'},
  {title:'Top matchs du jour', info:'Les grosses affiches sélectionnées automatiquement'},
  {title:'Mode gaming foot', info:'Design sombre, néon vert, vibe console + stade'}
];

function renderMatches(list) {
  matchesEl.innerHTML = list.map(m => `
    <div class="match-card ${/LIVE/i.test(m.status)?'live-row':''}">
      <div class="team">${m.home}</div>
      <div class="match-score">${m.score}</div>
      <div class="team">${m.away}</div>
      <div class="match-meta"><div>${m.minute}</div><div>${m.comp}</div><div>${m.status}</div></div>
    </div>
  `).join('');
}

function renderRajaPanel(matches){
  const rajaMatches = matches.filter(m => /raja casablanca/i.test(m.home+' '+m.away));
  if(!rajaPanelEl) return;
  if(!rajaMatches.length){
    rajaPanelEl.innerHTML = `
      <div class="raja-card live-focus">
        <div class="match-title">Raja Casablanca</div>
        <div class="mini-row"><span class="status soon">Focus club</span><span>En veille</span></div>
        <div class="mini-score">💚</div>
      </div>
      <div class="raja-card">
        <div class="match-title">Supporters mode</div>
        <div class="mini-row"><span class="status live pulse-live">RAJA</span><span>Nabil style</span></div>
        <div class="mini-score">⚽</div>
      </div>`;
    return;
  }
  rajaPanelEl.innerHTML = rajaMatches.slice(0,2).map((m,i)=>`
    <div class="raja-card ${i===0?'live-focus':''}">
      <div class="match-title">${m.home} vs ${m.away}</div>
      <div class="mini-row"><span class="status ${/LIVE/i.test(m.status)?'live pulse-live':'soon'}">${/LIVE/i.test(m.status)?'LIVE':'RAJA'}</span><span>${m.minute}</span></div>
      <div class="mini-score">${m.score}</div>
    </div>`).join('');
}

function renderBigGames() {
  bigGamesEl.innerHTML = bigGames.map(g => `
    <div class="big-card">
      <h3>${g.title}</h3>
      <div class="line">${g.info}</div>
    </div>
  `).join('');
}

async function loadLiveScores() {
  try {
    const res = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/all/scoreboard');
    const data = await res.json();
    const events = (data.events || []).slice(0, 12).map(ev => {
      const comp = ev.competitions?.[0];
      const teams = comp?.competitors || [];
      const home = teams.find(t => t.homeAway === 'home');
      const away = teams.find(t => t.homeAway === 'away');
      const status = comp?.status?.type?.shortDetail || comp?.status?.type?.description || 'Scheduled';
      const score = home && away ? `${home.score ?? '-'} - ${away.score ?? '-'}` : '--';
      const minute = comp?.status?.type?.detail || new Date(ev.date).toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' });
      return {
        home: home?.team?.displayName || 'Home',
        away: away?.team?.displayName || 'Away',
        score,
        minute,
        status,
        comp: ev.league?.name || ev.shortName || 'Football'
      };
    });
    if (events.length) {
      renderMatches(events);
      renderRajaPanel(events);
      if(featuredSublineEl){
        const liveCount = events.filter(e => /LIVE|in progress|halftime|[0-9]+'/.test(e.status+' '+e.minute)).length;
        featuredSublineEl.textContent = `${liveCount} matchs chauds en suivi • mise à jour auto toutes les 60 sec`;
      }
    } else {
      renderMatches(fallbackMatches);
    renderRajaPanel(fallbackMatches);
      renderRajaPanel(fallbackMatches);
    }
  } catch (e) {
    renderMatches(fallbackMatches);
    renderRajaPanel(fallbackMatches);
  }
}

renderBigGames();
renderMatches(fallbackMatches);
renderRajaPanel(fallbackMatches);
loadLiveScores();
setInterval(loadLiveScores, 60000);
