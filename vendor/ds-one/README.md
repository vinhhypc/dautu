# vendor/ds-one — mã nguồn ds-one chép vào dự án

Bản sao **mã nguồn TypeScript gốc** của gói `@vnd/ds-one@0.0.2`
(repo `trading-platform/system-uis/system-ui-26`, thư mục `packages/one`), khôi phục từ `sourcesContent` trong sourcemap của gói.
Dự án không còn cài `@vnd/ds-one` từ registry GitLab — không cần `GITLAB_NPM_TOKEN`.

Chỉ chép phần dự án dùng:

| File | Nguồn gốc |
|---|---|
| `components/Button.tsx`, `Badge.tsx`, `Card.tsx`, `DropdownMenu.tsx`, `buttonStyles.ts` | `src/components/*` |
| `utils/cn.ts`, `utils/scales.ts` | `src/utils/*` |
| `icons/createIcon.tsx` | `src/icons/createIcon.tsx` |
| `components/Breadcrumbs.tsx` | `src/components/Breadcrumbs.tsx` |
| `components/DatePicker.tsx` | `src/components/DatePicker.tsx` — **đã sửa**: prop `locale` (tên thứ/tháng theo `Intl` thay nhãn tiếng Việt cố định), `previousLabel`/`nextLabel`, "hôm nay" là ngày thật (Figma gắn 19/10/2026), cửa sổ 12 năm theo năm đang xem (Figma cố định 2020–2031), mũi tên nhảy theo màn Ngày/Tháng/Năm, bỏ `setState` trong `useEffect`, bỏ hằng số thừa. Không truyền `locale` thì giữ nguyên hành vi Figma |
| `components/Tabs.tsx` | `src/components/Tabs.tsx` (repo `system-ui-26`, thư mục `D:/VND20/system-ui-26`) — **đã rút gọn**: bỏ thuộc tính đo Figma (`data-figma-node`, `iconSwap`, `count`, `state`, `TabItem`) và icon đi kèm; giữ nguyên class các appearance Fill/Outline/Line bottom. Phụ thuộc `@radix-ui/react-tabs` |
| `icons/index.tsx` | 8 icon `CircleLine`, `ArrowUpLine`, `CheckLine`, `ArrowRightSLine`, `Home4Line`, `ArrowDownSLine`, `ArrowLeftSLine`, `CalendarLine` trích từ `src/icons/catalog-*.tsx` |
| `tokens/*.css` | `dist/tokens/*.css` (bỏ dòng `@source "../../stories"`) — **đã lược**: bỏ brand `dsb` (khối trong `brand.css`, palette `--color-dsb-*`, font Inter của `vndss`, selector `dsb`/`vndss`) và nhóm typography `mobile`; dautu chỉ dùng `data-brand="vnds"`. Chép lại từ gói thì phải lược lại (bản gốc có `dsb`, `vndss`, `mobile`). Giữ `webtrading` vì component ds-one dùng `text-webtrading-*` |

Khác biệt so với gói: bỏ đuôi `.js` trong import tương đối; thêm `'use client'` vào 7 file component như bản build của gói.

## Quy tắc

- Chỉ `components/ui/*` và `lib/cn.ts` được import từ `@/vendor/ds-one/...`. Section, layout, route dùng `components/ui/`.
- Sửa ở đây là sửa design system của dự án — giữ đồng bộ với Figma New One, ghi lại thay đổi trong bảng trên.
- Cần thêm component (Modal, Tabs, Select…): chép từ repo `system-ui-26` (`packages/one/src/components/`) cùng icon/util nó cần, thêm dependency (`@radix-ui/react-*`) vào `package.json`, rồi bọc trong `components/ui/`.
- `app/globals.css` có `@source "../vendor/ds-one"` để Tailwind sinh class dùng trong các file này.
