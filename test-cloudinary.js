
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  throw new Error("Cloudinary environment variables missing");
}

async function testUpload() {
  try {
    const imageBuffer = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/jXcAAAAASUVORK5CYII=",
      "base64"
    );

    const form = new FormData();

    form.append(
      "file",
      new Blob([imageBuffer], { type: "image/png" }),
      "test.png"
    );

    form.append("folder", "eventverse-test");

    const credentials = Buffer.from(
      `${apiKey}:${apiSecret}`
    ).toString("base64");

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
        },
        body: form,
      }
    );

    const body = await response.text();

    console.log("HTTP STATUS:", response.status);
    console.log("CLOUDINARY ERROR:", response.headers.get("x-cld-error"));
    console.log("RESPONSE BODY:", body);

  } catch (error) {
    console.error("REQUEST FAILED:", error.message);
  }
}

testUpload();
