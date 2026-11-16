const GENERIC_LABEL_MAX_WORDS = 3;

/* Link "Xem thêm"/"Tìm hiểu thêm" lặp lại trong nhiều thẻ: thêm tiêu đề thẻ vào tên link để trình đọc màn hình phân biệt được.
   Giữ nhãn hiển thị ở đầu tên (WCAG 2.5.3 — tên truy cập phải chứa chữ nhìn thấy); nhãn dài đã tự mô tả thì giữ nguyên. */
export function linkInContext(label: string, context?: string): string | undefined {
  const title = context?.replace(/\s+/g, " ").trim();
  if (!title || label.trim().split(/\s+/).length > GENERIC_LABEL_MAX_WORDS) return undefined;
  return label.toLocaleLowerCase("vi").includes(title.toLocaleLowerCase("vi")) ? undefined : `${label}: ${title}`;
}
