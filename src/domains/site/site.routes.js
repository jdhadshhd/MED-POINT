/**
 * Site Routes
 * Handles public landing pages
 */
const express = require('express');
const router = express.Router();
const siteController = require('./site.controller');

// Landing page
router.get('/', siteController.showLanding);

// About page
router.get('/about', siteController.showAbout);

module.exports = router;
