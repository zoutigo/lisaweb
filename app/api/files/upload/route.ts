import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  const envUploadDir = process.env.FILES_UPLOAD_DIR;
  const uploadDir = envUploadDir
    ? path.isAbsolute(envUploadDir)
      ? envUploadDir
      : path.join(process.cwd(), envUploadDir)
    : path.join(process.cwd(), "public", "files");

  const form = await request.formData();
  const file = form.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ message: "No file" }, { status: 400 });
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json(
      { message: "Fichier trop volumineux (max 5 Mo)" },
      { status: 400 },
    );
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  await mkdir(uploadDir, { recursive: true });

  const extensionFromType = file.type?.split("/")[1];
  const ext = file.name.split(".").pop() || extensionFromType || "bin";
  const safeExt = ext.replace(/[^a-zA-Z0-9]/g, "") || "file";
  const filename = `${Date.now()}-${Math.random().toString(16).slice(2)}.${safeExt}`;
  const filepath = path.join(uploadDir, filename);

  await writeFile(filepath, buffer);

  return NextResponse.json({ path: `/files/${filename}` });
}
