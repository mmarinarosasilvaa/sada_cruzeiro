module.exports = {
  SELECTORS: {
    root: 'footer',
    topicTitle: 'footer h3',
    topicItem: 'footer li a',
    copyright: 'footer .footer-bottom .footer-copyright p, footer .footer-copyright p',
  },
  TYPOGRAPHY: {
    topicTitle: {
      fontFamily: /noto[\s-]?sans/i,
      fontWeight: '900',
      fontSize: '14px',
      lineHeight: '14px',
      letterSpacing: ['0px', '0', 'normal'],
    },
    topicItem: {
      fontFamily: /noto[\s-]?sans/i,
      fontWeight: '700',
      fontSize: '12px',
      lineHeight: '12px',
      letterSpacing: ['0px', '0', 'normal'],
    },
    copyright: {
      fontFamily: /noto[\s-]?sans/i,
      fontWeight: '700',
      fontSize: '12px',
      lineHeight: '12px',
      letterSpacing: ['0px', '0', 'normal'],
    },
  },
  LAYOUT: {
    topicTitle: { width: 95, height: 19, top: 48, left: 80, opacity: 1, angleDeg: 0 },
    topicItem: { width: 63, height: 16, top: 79, left: 80, opacity: 1, angleDeg: 0 },
    copyright: { width: 166, height: 16, top: 265, left: 80, opacity: 1, angleDeg: 0 },
  },
  TOLERANCE_PX: 2,
};
