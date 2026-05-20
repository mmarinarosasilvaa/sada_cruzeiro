module.exports = {
  SELECTORS: {
    root: 'xpath=/html/body/main/div[1]/div',
    teamRoster: '.team-roster',
    headerTitle: '.team-roster-header-title',
    categoryList: '.team-roster-header-category-list',
    categoryButtons: '.team-roster-header-category-list > button',
    cardsGrid: '.team-roster-cards',
    card: '.team-roster-card',
    cardName: '.team-roster-card-name',
    cardPosition: '.team-roster-card-position',
    cardNumber: '.team-roster-card-number',
    cardPrimaryImage: '.team-roster-card-image',
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
