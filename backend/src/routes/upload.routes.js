const router     = require('express').Router();
const upload     = require('../middleware/upload.middleware');
const controller = require('../controllers/upload.controller');

router.post('/',    upload.single('file'), controller.uploadFile);
router.get('/log',  controller.getUploadLog);

module.exports = router;
