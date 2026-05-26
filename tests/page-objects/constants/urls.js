const DEFAULT_BASE =
  'https://main--cm-p181070-s22303-site-sada-cruzeiro--adobe-cm.aem.page';

const ELENCO_PAGE_PATH = '/elenco';
const PLAYER_PAGE_PATH = '/elenco/alexandre';
const ARTICLE_PAGE_PATH = '/noticias/noticia-de-teste-2';
const CAROUSEL_NEWS_PAGE_PATH = '/noticias';

function getBaseUrl() {
  const fromEnv = (process.env.E2E_BASE_URL || '').trim();
  if (fromEnv) return fromEnv.replace(/\/+$/, '');
  return DEFAULT_BASE;
}

function getPlayerPageUrl() {
  return `${getBaseUrl()}${PLAYER_PAGE_PATH}`;
}

function getElencoPageUrl() {
  return `${getBaseUrl()}${ELENCO_PAGE_PATH}`;
}

function getArticlePageUrl() {
  return `${getBaseUrl()}${ARTICLE_PAGE_PATH}`;
}

function getCarouselNewsPageUrl() {
  const fromEnv = (process.env.E2E_CAROUSEL_NEWS_URL || '').trim();
  if (fromEnv) return fromEnv.replace(/\/+$/, '');
  return `${getBaseUrl()}${CAROUSEL_NEWS_PAGE_PATH}`;
}

module.exports = {
  DEFAULT_BASE,
  ELENCO_PAGE_PATH,
  PLAYER_PAGE_PATH,
  ARTICLE_PAGE_PATH,
  CAROUSEL_NEWS_PAGE_PATH,
  getBaseUrl,
  getElencoPageUrl,
  getPlayerPageUrl,
  getArticlePageUrl,
  getCarouselNewsPageUrl,
};
