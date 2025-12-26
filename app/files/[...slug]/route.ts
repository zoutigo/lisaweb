import { NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

const contentTypeByExt: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".avif": "image/avif",
};

function getUploadDir() {
  const envUploadDir = process.env.FILES_UPLOAD_DIR;
  return envUploadDir
    ? path.isAbsolute(envUploadDir)
      ? envUploadDir
      : path.join(process.cwd(), envUploadDir)
    : path.join(process.cwd(), "public", "files");
}

type Params =
  | { slug: string[] }
  | Promise<{ slug: string[] }>
  | { slug?: string[] | undefined }
  | Promise<{ slug?: string[] | undefined }>;

export async function GET(_req: Request, { params }: { params: Params }) {
  const uploadDir = getUploadDir();
  const resolvedParams = await Promise.resolve(params);
  const parts = Array.isArray(resolvedParams.slug) ? resolvedParams.slug : [];
  if (parts.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const targetPath = path.resolve(path.join(uploadDir, ...parts));
  const base = path.resolve(uploadDir);
  if (!targetPath.startsWith(base)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const [fileBuffer, fileStat] = await Promise.all([
      readFile(targetPath),
      stat(targetPath),
    ]);
    const ext = path.extname(targetPath).toLowerCase();
    const contentType = contentTypeByExt[ext] || "application/octet-stream";

    return new Response(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": fileStat.size.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    if (process.env.NODE_ENV !== "test") {
      console.error("Failed to serve file", error);
    }
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
