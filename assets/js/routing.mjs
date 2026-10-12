export const viewNames = ['fix', 'workflows', 'reference', 'playground', 'learn'];
export function parseRoute(hash) {
  let decoded; try { decoded = decodeURIComponent(hash.replace(/^#/, '')); } catch { return { view: 'fix', item: null, legacy: null, malformed: true }; }
  const [view, item] = decoded.split('/');
  if (viewNames.includes(view)) return { view, item: item || null, legacy: null, malformed: false };
  return { view: null, item: null, legacy: decoded || null, malformed: false };
}
