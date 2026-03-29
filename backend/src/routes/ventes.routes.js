const router     = require('express').Router();
const controller = require('../controllers/ventes.controller');
const { validateDateRange } = require('../middleware/validate.middleware');

router.get('/carburants', validateDateRange, controller.getCarburants);
router.get('/produits',   validateDateRange, controller.getProduits);
router.get('/services',   validateDateRange, controller.getServices);

module.exports = router;
