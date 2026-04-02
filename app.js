const matches = [
  {home:'Raja Casablanca', away:'Wydad', score:'2 - 1', minute:"68'", status:'LIVE', comp:'Botola Pro'},
  {home:'PSG', away:'Marseille', score:'1 - 0', minute:"42'", status:'LIVE', comp:'Ligue 1'},
  {home:'Real Madrid', away:'Barça', score:'3 - 2', minute:'FT', status:'FT', comp:'La Liga'},
  {home:'Man City', away:'Liverpool', score:'19:30', minute:'Soon', status:'SOON', comp:'Premier League'},
  {home:'Bayern', away:'Dortmund', score:'20:45', minute:'Soon', status:'SOON', comp:'Bundesliga'},
  {home:'Inter', away:'Milan', score:'0 - 0', minute:"12'", status:'LIVE', comp:'Serie A'},
];
const bigGames = [
  {title:'Raja Casablanca vs Wydad', info:'Derby chaud • Live vibes • Nabil mode ON'},
  {title:'PSG vs Marseille', info:'Big clash français • ambiance stade'},
  {title:'Man City vs Liverpool', info:'Top match pour ce soir • gros niveau'}
];
const matchesEl = document.getElementById('matches');
const bigGamesEl = document.getElementById('bigGames');
matchesEl.innerHTML = matches.map(m => `
  <div class="match-card">
    <div class="team">${m.home}</div>
    <div class="match-score">${m.score}</div>
    <div class="team">${m.away}</div>
    <div class="match-meta"><div>${m.minute}</div><div>${m.comp}</div><div>${m.status}</div></div>
  </div>
`).join('');
bigGamesEl.innerHTML = bigGames.map(g => `
  <div class="big-card">
    <h3>${g.title}</h3>
    <div class="line">${g.info}</div>
  </div>
`).join('');
