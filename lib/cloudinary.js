import { v2 as cloudinary } from "cloudinary";

// Fail fast with a clear message if env vars are missing
const required = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];
for (const key of required) {
  if (!process.env[key]) {
    console.warn(`⚠️  Missing env var: ${key}. Cloudinary uploads will fail.`);
  }
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };