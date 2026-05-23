const path = require('path');
const multer = require('multer');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');

const allowed = ['application/pdf', 'image/png', 'image/jpeg'];

const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', '..', env.uploadDir),
  filename: (_req, file, callback) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9_.-]/g, '-');
    callback(null, `${Date.now()}-${safeName}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (!allowed.includes(file.mimetype)) {
      return callback(new ApiError(400, 'Formato de arquivo nao permitido.'));
    }

    return callback(null, true);
  }
});

module.exports = upload;
