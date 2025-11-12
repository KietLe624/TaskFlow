require("dotenv").config(); // ✅ Bắt buộc để load file .env

const AWS = require("aws-sdk");

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || "ap-southeast-1",
});

const s3 = new AWS.S3();

console.log("AccessKey:", process.env.AWS_ACCESS_KEY_ID);

s3.listBuckets((err, data) => {
  if (err) console.error(" Lỗi:", err);
  else
    console.log(" Kết nối thành công:", data.Buckets.map((b) => b.Name));
});
