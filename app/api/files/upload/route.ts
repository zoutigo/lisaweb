import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ message: "No file" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadDir = path.join(process.cwd(), "public", "files");
  await mkdir(uploadDir, { recursive: true });

  const ext = file.name.split(".").pop();
  const filename = `${Date.now()}-${Math.random().toString(16).slice(2)}${ext ? `.${ext}` : ""}`;
  const filepath = path.join(uploadDir, filename);

  await writeFile(filepath, buffer);

  return NextResponse.json({ path: `/files/${filename}` });
}
