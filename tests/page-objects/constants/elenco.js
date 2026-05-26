module.exports = {
  SELECTORS: {
    root: 'xpath=/html/body/main/div[1]/div',
    teamRoster: '.team-roster',
    headerTitle: '.team-roster-header-title',
    categoryList: '.team-roster-header-category-list',
    categoryButtons: '.team-roster-header-category-list > button',
    categoryTabs: "[role='tab'], .team-roster-header-category-list > button",
    activeTab: "[role='tab'][aria-selected='true'], .team-roster-header-category-list > button.selected",
    cardsGrid: '.team-roster-cards',
    card: '.team-roster-card',
    castCard: '.cast-card, .team-roster-card',
    cardName: '.team-roster-card-name',
    cardPosition: '.cast-card .position, .team-roster-card-position',
    cardNumber: '.cast-card .number, .team-roster-card-number',
    cardPrimaryImage: '.cast-card img, .team-roster-card-image',
    cardHoverImage: '.team-roster-card-image-hover',
  },
  TEXT: {
    categoryButtons: ['Elenco Principal', 'Sub 17', 'Elenco'],
  },
  TYPOGRAPHY: {
    display: {
      fontFamily: /noto[\s-]?sans/i,
      fontWeight: '900',
      fontStyle: /normal/i,
      fontSize: '32px',
    },
  },
  LAYOUT: {
    castList: {
      width: 1207,
      height: 1456,
      opacity: 1,
      angleDeg: 0,
      gap: 20,
    },
    teamSelection: {
      width: 534,
      height: 44,
      opacity: 1,
      angleDeg: 0,
      gap: 16,
    },
  },
  TOLERANCE_PX: 2,
};
