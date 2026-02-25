/**
 * Site Controller
 * Handles public pages
 */

const siteController = {
  /**
   * GET / - Show landing page
   */
  showLanding(req, res) {
    res.render('site/views/index', {
      layout: false,
    });
  },

  /**
   * GET /about - Show about page
   */
  showAbout(req, res) {
    res.render('site/views/about', {
      layout: false,
    });
  },
};

module.exports = siteController;
