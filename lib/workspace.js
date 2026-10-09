/**
 * Workspace ids were historically stored as numbers on some documents and as
 * strings on others. Match both forms so older data keeps working.
 */
export function workspaceIdVariants(workspaceId) {
  const id = String(workspaceId);
  const variants = [id];
  if (/^\d+$/.test(id)) variants.push(Number(id));
  return variants;
}

/**
 * Normalise a stored cover image value to a path under /Assets/coverImages.
 */
export function coverImageSrc(coverImage, fallback = "/Assets/coverImages/cover3.jpg") {
  if (!coverImage) return fallback;
  if (coverImage.startsWith("/Assets/coverImages/")) return coverImage;
  const fileName = coverImage.replace(/^.*[\/]/, "");
  return fileName ? `/Assets/coverImages/${fileName}` : fallback;
}
