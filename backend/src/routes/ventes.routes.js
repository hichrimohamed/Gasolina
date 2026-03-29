const router     = require('express').Router();
const controller = require('../controllers/ventes.controller');

router.get('/carburants', controller.getCarburants);
router.get('/produits',   controller.getProduits);
router.get('/services',   controller.getServices);

module.exports = router;
