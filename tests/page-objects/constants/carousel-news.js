module.exports = {
  SELECTORS: {
    root: '.carousel-news',
    sectionTitle: "h2[class*='carousel-title'], h2[class*='carousel-news'], .carousel-news > h2",
    cardList: '.carousel-news-cards, .carousel-news-list, .carousel-container',
    card: '.carousel-item, .carousel-news-card',
    cardTitle: '.carousel-item h2, .carousel-item h3, .carousel-news-card-title',
    cardImage: '.carousel-item img, .carousel-news-card img',
    cardDate: '.carousel-item time, .carousel-news-card-date',
    cardLink: '.carousel-item a[href], .carousel-news-card a[href]',
    navPrev: "button[aria-label='Anterior'], .carousel-news-nav-prev, [aria-label*='anterior' i]",
    navNext: "button[aria-label='Próximo'], .carousel-news-nav-next, [aria-label*='próximo' i]",
    indicators: "[class*='carousel-indicators'] .dot, [class*='carousel-indicators'] button, [role='tablist'] [role='tab']",
    shareLink: '[class*="share" i] a[href], .carousel-news-share a[href]',
  },
  BREAKPOINTS: {
    desktopMin: { width: 1200, height: 720 },
    mobileMax: { width: 768, height: 1024 },
    zoom200: { width: 640, height: 960 },
    reflow320: { width: 320, height: 900 },
  },
  TOLERANCE_PX: 4,
};
