(function () {
  if (typeof window === 'undefined') return;

  var KEY = 'gatectr-locale';
  var path = window.location.pathname;
  var currentLocale = path.startsWith('/fr') ? 'fr' : 'en';
  var stored = localStorage.getItem(KEY);

  function redirectToFr() {
    var base = path === '/' ? '' : path;
    localStorage.setItem(KEY, 'fr');
    window.location.replace('/fr' + base + window.location.search);
  }

  if (stored === null) {
    var lang = (navigator.language || navigator.userLanguage || '').toLowerCase();
    if (lang.startsWith('fr') && currentLocale !== 'fr') {
      redirectToFr();
      return;
    }
    localStorage.setItem(KEY, currentLocale);
  } else if (stored === 'fr' && currentLocale !== 'fr') {
    redirectToFr();
    return;
  }

  localStorage.setItem(KEY, currentLocale);
})();
