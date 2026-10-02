(() => {
  const SUPPORTED_LANGS = ["en", "tr"];
  const DEFAULT_LANG = "en";
  const STORAGE_KEY = "policy-lang";
  const QUERY_PARAM = "lang";

  const articles = document.querySelectorAll("article[data-lang]");
  const buttons = document.querySelectorAll(".lang-switch [data-lang]");

  const isSupported = (lang) => SUPPORTED_LANGS.includes(lang);

  const readStoredLang = () => {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  };

  const storeLang = (lang) => {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Storage can be unavailable (private mode); the choice simply won't persist.
    }
  };

  const resolveInitialLang = () => {
    const fromQuery = new URLSearchParams(location.search).get(QUERY_PARAM);
    if (isSupported(fromQuery)) return fromQuery;

    const fromStorage = readStoredLang();
    if (isSupported(fromStorage)) return fromStorage;

    const browserLang = (navigator.language || "").slice(0, 2).toLowerCase();
    return isSupported(browserLang) ? browserLang : DEFAULT_LANG;
  };

  const updateUrl = (lang) => {
    const url = new URL(location.href);
    url.searchParams.set(QUERY_PARAM, lang);
    history.replaceState(null, "", url);
  };

  const applyLang = (lang) => {
    articles.forEach((article) => {
      article.hidden = article.dataset.lang !== lang;
    });
    buttons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.lang === lang));
    });
    document.documentElement.lang = lang;
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const lang = button.dataset.lang;
      applyLang(lang);
      storeLang(lang);
      updateUrl(lang);
    });
  });

  // The browser tries to jump to the hash before the target's article is unhidden,
  // so re-run the jump once the right language is visible.
  const scrollToHashTarget = () => {
    const id = decodeURIComponent(location.hash.slice(1));
    const target = id && document.getElementById(id);
    if (target) target.scrollIntoView();
  };

  applyLang(resolveInitialLang());
  scrollToHashTarget();
})();
