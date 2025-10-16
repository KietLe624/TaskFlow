const multer = require("multer");
const AWS = require("aws-sdk");
const multerS3 = require("multer-s3");
const path = require("path");
require("dotenv").config();


AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

const uploadS3 = multer({
  storage: multerS3({
    s3,
    bucket: process.env.AWS_BUCKET_NAME,
    acl: "private",
    key: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const filename = `chat/${Date.now()}_${Math.round(
        Math.random() * 1e9
      )}${ext}`;
      cb(null, filename);
    },
  }),
});

module.exports = uploadS3;
