const express = require('express');
const router = express.Router();
const controller = require('../controllers/brandController');

router.post('/update', controller.updateBrand);
router.post('/save', controller.saveSnapshot);
router.get('/versions', controller.getVersions);
router.post('/revert', controller.revertVersion);

module.exports = router;
