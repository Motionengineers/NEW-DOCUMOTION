const express = require('express');
const router = express.Router();
const controller = require('../controllers/exportController');

router.post('/pdf', controller.generatePdf);
router.get('/logo', controller.exportLogo);
router.get('/palette', controller.exportPalette);
router.post('/share', controller.generateShareLink);

module.exports = router;
