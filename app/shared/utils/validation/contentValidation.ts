/*
@description Função que verifica se a categoria é uma categoria de feed do Instagram e Stories
@params category: string
@params stories: boolean
@returns boolean
*/
export function isInstagramFeed(category: string, stories = false) {
  return ["post", "reels", "carousel", stories ? "stories" : null].includes(
    category,
  );
}

// File type validation utilities
const FILE_EXTENSIONS = {
  video: [
    ".mp4",
    ".mov",
    ".avi",
    ".mkv",
    ".webm",
    ".m4v",
    ".3gp",
    ".flv",
    ".wmv",
    ".ogv",
  ],
  image: [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".webp",
    ".svg",
    ".bmp",
    ".tiff",
    ".ico",
  ],
  document: [
    ".pdf",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
    ".ppt",
    ".pptx",
    ".txt",
    ".rtf",
    ".odt",
    ".ods",
    ".odp",
  ],
} as const;

export type FileType = "video" | "image" | "document" | "unknown";

export function getTypeOfTheContent(content: string): FileType {
  const lowerContent = content.toLowerCase();

  // Check if it contains "video" in the URL path (for Cloudinary URLs)
  if (lowerContent.includes("/video/")) {
    return "video";
  }

  // Check video extensions
  if (FILE_EXTENSIONS.video.some((ext) => lowerContent.includes(ext))) {
    return "video";
  }

  // Check image extensions
  if (FILE_EXTENSIONS.image.some((ext) => lowerContent.includes(ext))) {
    return "image";
  }

  // Check document extensions
  if (FILE_EXTENSIONS.document.some((ext) => lowerContent.includes(ext))) {
    return "document";
  }

  return "unknown";
}

export function isVideo(file: string): boolean {
  return getTypeOfTheContent(file) === "video";
}

export function isImage(file: string): boolean {
  return getTypeOfTheContent(file) === "image";
}

export function isDocument(file: string): boolean {
  return getTypeOfTheContent(file) === "document";
}

export function getFileExtension(file: string): string {
  // Remove query parameters and hash
  const cleanFile = file.split("?")[0].split("#")[0];

  // Get the last part after the last dot
  const extension = cleanFile.split(".").pop()?.toLowerCase() || "";

  return extension ? `.${extension}` : "";
}

export function getFileName(file: string, noExtension = false): string {
  // Remove query parameters and hash
  const cleanFile = file.split("?")[0].split("#")[0];

  // Get filename from URL path
  const filename = cleanFile.split("/").pop() || "Arquivo";

  if (noExtension) {
    // Remove extension from filename
    const lastDotIndex = filename.lastIndexOf(".");
    return lastDotIndex > 0 ? filename.substring(0, lastDotIndex) : filename;
  }

  return filename; // filename already includes extension
}
