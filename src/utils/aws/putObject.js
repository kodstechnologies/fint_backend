import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "./s3-credentials.js";

export const putObject = async (file, fileName) => {
  try {
    // 🔴 IMPORTANT: multer.memoryStorage gives `buffer`
    if (!file || !file.buffer) {
      throw new Error("File buffer is missing");
    }

    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: fileName,
      Body: file.buffer, // ✅ THIS uploads image to AWS
      ContentType: file.mimetype || "application/octet-stream",
    };

    await s3Client.send(new PutObjectCommand(params));

    const url = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

    return { url, key: fileName };
  } catch (err) {
    console.error("Error uploading file to S3:", err);
    throw err;
  }
};
