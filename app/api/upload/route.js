
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { cloudinary } from "@/lib/cloudinary";

export const runtime = "nodejs";

const MAX_SIZE = 8 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

const ALLOWED_FOLDERS = [
  "events",
  "certificates",
  "profiles",
  "communities",
  "misc",
];

export async function POST(req) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");

    const requestedFolder = formData.get("folder") || "misc";

    if (!file || typeof file.arrayBuffer !== "function") {
      return NextResponse.json(
        { error: "No valid file provided" },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        { error: "File is empty" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Maximum file size is 8MB" },
        { status: 413 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Only JPEG, PNG, WebP and PDF are allowed" },
        { status: 415 }
      );
    }

    if (!ALLOWED_FOLDERS.includes(requestedFolder)) {
      return NextResponse.json(
        { error: "Invalid upload folder" },
        { status: 400 }
      );
    }

    // Verify Cloudinary configuration
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      throw new Error("Cloudinary environment variables are missing");
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const folder = `eventverse/${requestedFolder}/${session.user.id}`;

    const isImage = file.type.startsWith("image/");

    const result = await new Promise((resolve, reject) => {
      const uploadOptions = {
        folder,
        resource_type: "auto",
        ...(isImage && {
          transformation: [
            { quality: "auto" },
            { fetch_format: "auto" },
          ],
        }),
      };

      cloudinary.uploader
        .upload_stream(uploadOptions, (error, result) => {
          if (error) return reject(error);
          resolve(result);
        })
        .end(buffer);
    });

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      resourceType: result.resource_type,
      width: result.width || null,
      height: result.height || null,
    });

  } catch (error) {
  console.error("CLOUDINARY DEBUG:", {
    message: error.message,
    http_code: error.http_code,
    name: error.name,
    response: error.response?.body,
    headers: error.response?.headers,
  });

  return NextResponse.json(
    {
      success: false,
      error: error.message,
      cloudinaryCode: error.http_code,
    },
    { status: 502 }
  );
}
}
