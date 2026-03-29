const multer  = require('multer');
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.originalname.match(/\.(xls|xlsx)$/i)) cb(null, true);
    else cb(new Error('Only .xls/.xlsx files are accepted'));
  },
  limits: { fileSize: 10 * 1024 * 1024 },
});

module.exports = upload;
