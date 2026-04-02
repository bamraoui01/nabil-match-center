const matchesEl = document.getElementById('matches');
const bigGamesEl = document.getElementById('bigGames');
const rajaPanelEl = document.getElementById('rajaPanel');
const featuredSublineEl = document.getElementById('featuredSubline');
const featuredMatchEl = document.getElementById('featuredMatch');
const featuredStatusEl = document.getElementById('featuredStatus');
const statsGridEl = document.getElementById('statsGrid');

function isLiveMatch(m){
  const blob = `${m.status} ${m.minute}`.toLowerCase();
  return /live|in progress|halftime|half-time|[0-9]+'/.test(blob) && !/scheduled|not started|canceled|postponed|ft|full time/.test(blob);
}

function renderFeatured(match){
  if(!match){
    featuredStatusEl.className = 'status soon';
    featuredStatusEl.textContent = 'NO LIVE';
    featuredMatchEl.innerHTML = `
      <div class="team-block"><div class="team-name">Aucun match</div><div class="score">—</div></div>
      <div class="match-center"><div class="minute">Now</div><div class="vs">VS</div><div class="competition">En attente</div></div>
      <div class="team-block"><div class="team-name">en cours</div><div class="score">—</div></div>`;
    return;
  }
  featuredStatusEl.className = `status ${isLiveMatch(match) ? 'live pulse-live' : 'soon'}`;
  featuredStatusEl.textContent = isLiveMatch(match) ? 'LIVE' : 'MATCH';
  featuredMatchEl.innerHTML = `
    <div class="team-block"><div class="team-name">${match.home}</div><div class="score">${match.score.split(' - ')[0] || '—'}</div></div>
    <div class="match-center"><div class="minute">${match.minute}</div><div class="vs">VS</div><div class="competition">${match.comp}</div></div>
    <div class="team-block"><div class="team-name">${match.away}</div><div class="score">${match.score.split(' - ')[1] || '—'}</div></div>`;
}

function renderStats(events, liveEvents, rajaMatches){
  const totalGoals = liveEvents.reduce((acc,m)=>{
    const parts=(m.score||'').split(' - ').map(x=>parseInt(x,10));
    return acc + (isNaN(parts[0])?0:parts[0]) + (isNaN(parts[1])?0:parts[1]);
  },0);
  statsGridEl.innerHTML = `
    <div class="stat-card"><span>Matchs live</span><strong>${liveEvents.length}</strong></div>
    <div class="stat-card"><span>Aujourd’hui</span><strong>${events.length}</strong></div>
    <div class="stat-card"><span>Raja détecté</span><strong>${rajaMatches.length}</strong></div>
    <div class="stat-card"><span>Buts live</span><strong>${totalGoals}</strong></div>`;
}

function renderMatches(list) {
  matchesEl.innerHTML = list.length ? list.map(m => `
    <div class="match-card ${isLiveMatch(m)?'live-row':''}">
      <div class="team">${m.home}</div>
      <div class="match-score">${m.score}</div>
      <div class="team">${m.away}</div>
      <div class="match-meta"><div>${m.minute}</div><div>${m.comp}</div><div>${m.status}</div></div>
    </div>
  `).join('') : `<div class="big-card"><h3>Aucun match en cours</h3><div class="line">Reviens plus tard pour du vrai live.</div></div>`;
}

function renderRajaPanel(matches){
  const rajaMatches = matches.filter(m => /raja casablanca/i.test(`${m.home} ${m.away}`));
  if(!rajaPanelEl) return;
  if(!rajaMatches.length){
    rajaPanelEl.innerHTML = `
      <div class="raja-card live-focus">
        <div class="match-title">Raja Casablanca</div>
        <div class="mini-row"><span class="status soon">Aucun match détecté</span><span>Source live</span></div>
        <div class="mini-score">—</div>
      </div>
      <div class="raja-card">
        <div class="match-title">Mode supporters</div>
        <div class="mini-row"><span class="status soon">En attente</span><span>Pas de fake score</span></div>
        <div class="mini-score">💚</div>
      </div>`;
    return rajaMatches;
  }
  rajaPanelEl.innerHTML = rajaMatches.slice(0,2).map((m,i)=>`
    <div class="raja-card ${i===0?'live-focus':''}">
      <div class="match-title">${m.home} vs ${m.away}</div>
      <div class="mini-row"><span class="status ${isLiveMatch(m)?'live pulse-live':'soon'}">${isLiveMatch(m)?'LIVE':'MATCH'}</span><span>${m.minute}</span></div>
      <div class="mini-score">${m.score}</div>
    </div>`).join('');
  return rajaMatches;
}

function renderBigGames(nonLiveEvents) {
  bigGamesEl.innerHTML = nonLiveEvents.length ? nonLiveEvents.map(g => `
    <div class="big-card">
      <h3>${g.home} vs ${g.away}</h3>
      <div class="line">${g.comp} • ${g.minute} • ${g.status}</div>
    </div>
  `).join('') : `<div class="big-card"><h3>Rien à afficher</h3><div class="line">Pas de match à venir/terminé remonté.</div></div>`;
}

async function loadLiveScores() {
  try {
    const res = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/all/scoreboard');
    const data = await res.json();
    const events = (data.events || []).map(ev => {
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
    const liveEvents = events.filter(isLiveMatch);
    const nonLiveEvents = events.filter(e => !isLiveMatch(e)).slice(0, 6);
    const featured = liveEvents[0] || events[0] || null;
    renderFeatured(featured);
    renderMatches(liveEvents);
    const rajaMatches = renderRajaPanel(events);
    renderBigGames(nonLiveEvents);
    renderStats(events, liveEvents, rajaMatches);
    featuredSublineEl.textContent = liveEvents.length
      ? `${liveEvents.length} matchs réellement en cours • mise à jour auto toutes les 60 sec`
      : `Aucun match vraiment en cours pour le moment • affichage honnête des données source`;
  } catch (e) {
    renderFeatured(null);
    renderMatches([]);
    const rajaMatches = renderRajaPanel([]);
    renderBigGames([]);
    renderStats([], [], rajaMatches);
    featuredSublineEl.textContent = 'Source live indisponible pour le moment.';
  }
}

loadLiveScores();
setInterval(loadLiveScores, 60000);
