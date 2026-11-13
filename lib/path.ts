/* WordPress trả slug Unicode dạng %xx chữ thường, Next/Nginx có thể gửi chữ hoa hoặc đã giải mã — so sánh trên dạng đã giải mã. */
export function normalizePath(path: string): string {
  let decoded = path;
  try {
    decoded = decodeURI(path);
  } catch {}
  const clean = decoded.split(/[?#]/)[0].normalize("NFC").toLowerCase();
  const withLeading = clean.startsWith("/") ? clean : `/${clean}`;
  return withLeading.endsWith("/") ? withLeading : `${withLeading}/`;
}
