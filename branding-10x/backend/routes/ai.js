const express = require('express');
const router = express.Router();
const controller = require('../controllers/aiController');

router.post('/logo', controller.generateLogos);
router.post('/product-images', controller.generateProductImages);
router.post('/taglines', controller.generateTaglines);
router.post('/suggestions', controller.getSuggestions);

module.exports = router;
