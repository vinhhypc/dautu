# components/ui — adapter cho ds-one (`vendor/ds-one`)

Các component ở đây bọc component / class của **ds-one** (`@/vendor/ds-one/...`) và giữ API riêng của dự án (variant, size theo tên dự án).

- Section, layout và route chỉ dùng component từ thư mục này — không import `@/vendor/ds-one` trực tiếp.
- Đổi mapping (vd. `secondary` → hierarchy nào của ds-one) chỉ cần sửa ở đây, ví dụ `button-styles.ts`.
- Cần component mới → chép component từ ds-one vào `vendor/ds-one/` (xem README ở đó) rồi bọc lại ở đây.

Bảng mapping hiện tại: xem mục "Design System ds-one" trong `AGENTS.md`.
