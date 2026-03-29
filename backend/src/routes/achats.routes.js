const router     = require('express').Router();
const controller = require('../controllers/achats.controller');
const { validateDateRange } = require('../middleware/validate.middleware');

router.get('/carburants', validateDateRange, controller.getCarburants);
router.get('/produits',   validateDateRange, controller.getProduits);

module.exports = router;
