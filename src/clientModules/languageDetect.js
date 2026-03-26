(function () {
  if (typeof window === 'undefined') return;

  var KEY = 'gatectr-lang-detected';

  if (localStorage.getItem(KEY)) return;

  localStorage.setItem(KEY, '1');

  var path = window.location.pathname;

  if (path.startsWith('/fr')) return;

  var lang = (navigator.language || navigator.userLanguage || '').toLowerCase();
  if (!lang.startsWith('fr')) return;

  var base = path === '/' ? '' : path;
  window.location.replace('/fr' + base + window.location.search);
})();
