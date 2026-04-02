const matchesEl = document.getElementById('matches');
const bigGamesEl = document.getElementById('bigGames');

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
    <div class="match-card">
      <div class="team">${m.home}</div>
      <div class="match-score">${m.score}</div>
      <div class="team">${m.away}</div>
      <div class="match-meta"><div>${m.minute}</div><div>${m.comp}</div><div>${m.status}</div></div>
    </div>
  `).join('');
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
    if (events.length) renderMatches(events);
    else renderMatches(fallbackMatches);
  } catch (e) {
    renderMatches(fallbackMatches);
  }
}

renderBigGames();
renderMatches(fallbackMatches);
loadLiveScores();
setInterval(loadLiveScores, 60000);
