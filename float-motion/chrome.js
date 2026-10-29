// Prototype chrome for the Float concept: picks the colourway before first paint, then builds the
// top-left picker (concept pages + live colourway swap). Load in <head>.
window.FloatChrome = (() => {
  const CONCEPTS = [
    { href: 'index.html', label: 'Float' },
    { href: 'build.html', label: 'Build' },
    { href: '../stack/index.html', label: 'Stack' },
    { href: '../split/index.html', label: 'Split' },
  ];
  const COLORWAYS = [
    { id: 'neutral', label: 'Neutral', swatch: '#F6EFE8' },
    { id: 'navy',    label: 'Navy',    swatch: 'linear-gradient(135deg, #012346 45%, #065998)' },
    { id: 'navy-solid', label: 'Navy Solid', swatch: '#012346' },
    { id: 'sky',     label: 'Sky',     swatch: '#DFEEFF' },
  ];
  const store = {
    get() { try { return localStorage.getItem('float-colorway'); } catch { return null; } },
    set(v) { try { localStorage.setItem('float-colorway', v); } catch {} },
  };
  const valid = id => COLORWAYS.some(c => c.id === id);
  const fromUrl = new URLSearchParams(location.search).get('c');
  let colorway = valid(fromUrl) ? fromUrl : valid(store.get()) ? store.get() : 'neutral';
  const root = document.documentElement;
  root.dataset.colorway = colorway;

  let dim = 1;
  const readDim = () => { dim = parseFloat(getComputedStyle(root).getPropertyValue('--hero-dim')) || 1; };
  readDim();   // float.css is linked before this script, so the tokens are already available

  function setColorway(id) {
    if (!valid(id) || id === colorway) return;
    colorway = id;
    root.dataset.colorway = id;
    store.set(id);
    const q = new URLSearchParams(location.search); q.set('c', id);
    history.replaceState(null, '', '?' + q.toString() + location.hash);
    readDim();
    nav.querySelectorAll('[data-c]').forEach(b => b.setAttribute('aria-pressed', b.dataset.c === id));
    nav.querySelectorAll('[data-href]').forEach(a => { a.href = `${a.dataset.href}?c=${id}`; });
  }

  const here = location.pathname.split('/').pop() || 'index.html';
  const nav = document.createElement('nav');
  nav.className = 'switcher';
  nav.setAttribute('aria-label', 'Prototype');
  nav.innerHTML =
    CONCEPTS.map(c => `<a data-href="${c.href}" href="${c.href}?c=${colorway}"${c.href === here ? ' aria-current="page"' : ''}>${c.label}</a>`).join('') +
    '<span class="switcher-sep" aria-hidden="true"></span>' +
    COLORWAYS.map(c => `<button type="button" data-c="${c.id}" aria-pressed="${c.id === colorway}"><span class="swatch" style="background:${c.swatch}"></span>${c.label}</button>`).join('');
  nav.addEventListener('click', e => {
    const b = e.target.closest('[data-c]');
    if (b) setColorway(b.dataset.c);
  });
  addEventListener('DOMContentLoaded', () => { document.body.appendChild(nav); readDim(); });

  return { get dim() { return dim; }, get colorway() { return colorway; }, setColorway };
})();
