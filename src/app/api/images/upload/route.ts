import { NextResponse } from "next/server";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getImgBBMessage(payload: unknown) {
  if (
    isRecord(payload) &&
    isRecord(payload.error) &&
    typeof payload.error.message === "string"
  ) {
    return payload.error.message;
  }
  return "ImgBB could not upload this image.";
}

export async function POST(request: Request) {
  const apiKey = process.env.IMAGEBB_SECRET;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Profile image upload is not configured." },
      { status: 500 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "A valid image file is required." },
      { status: 400 },
    );
  }

  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json(
      { error: "Choose an image to upload." },
      { status: 400 },
    );
  }
  if (!ACCEPTED_IMAGE_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Use a JPG, PNG, WebP, or GIF image." },
      { status: 415 },
    );
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return NextResponse.json(
      { error: "The image must be 5 MB or smaller." },
      { status: 413 },
    );
  }

  const uploadData = new FormData();
  uploadData.set("image", file);

  let response: Response;
  try {
    response = await fetch(
      `https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        body: uploadData,
      },
    );
  } catch {
    return NextResponse.json(
      { error: "Could not connect to ImgBB. Please try again." },
      { status: 502 },
    );
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    return NextResponse.json(
      { error: "ImgBB returned an invalid response." },
      { status: 502 },
    );
  }

  if (!response.ok) {
    return NextResponse.json(
      { error: getImgBBMessage(payload) },
      { status: 502 },
    );
  }

  if (
    !isRecord(payload) ||
    !isRecord(payload.data) ||
    typeof payload.data.url !== "string"
  ) {
    return NextResponse.json(
      { error: "ImgBB did not return an image URL." },
      { status: 502 },
    );
  }

  return NextResponse.json({ url: payload.data.url });
}
