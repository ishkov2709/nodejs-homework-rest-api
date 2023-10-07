const multer = require("multer");
const path = require("path");

const tempPath = path.join(__dirname, "../", "tmp");

const tempConfig = multer.diskStorage({
  destination: tempPath,
  filename: (_, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage: tempConfig,
});

module.exports = upload;
