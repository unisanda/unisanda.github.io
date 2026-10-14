'use strict';
globalThis.GameCatalog = {
  select(games, {query = '', platform = 'all', sort = 'earliest'} = {}) {
    return games.filter(g => (g.title + ' ' + (g.summary || '')).toLowerCase().includes(query.trim().toLowerCase()) && (platform === 'all' || g.platforms.includes(platform)))
      .sort((a,b) => sort === 'title' ? a.title.localeCompare(b.title) : (sort === 'latest' ? -1 : 1) * a.date.localeCompare(b.date));
  },
  status(date, today) {
    const days = Math.round((Date.parse(date + 'T00:00:00Z') - Date.parse(today + 'T00:00:00Z')) / 86400000);
    return days < 0 ? 'صدر حسب الموعد المعلن' : days === 0 ? 'موعده اليوم' : days === 1 ? 'غداً' : `متبقي ${days} يوماً`;
  }
};
