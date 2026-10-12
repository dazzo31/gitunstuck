export function matchesFilters({ category, effects, text }, { query = '', category: selectedCategory = 'all', effect = 'all' }) {
  const tokens = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  return (selectedCategory === 'all' || category === selectedCategory)
    && (effect === 'all' || effects.includes(effect))
    && tokens.every(token => text.toLowerCase().includes(token));
}
