import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const HEX_COLOR = String.raw`/#[0-9a-fA-F]{3,8}\b/`;
const ARBITRARY_PX = String.raw`/\[-?\d+(\.\d+)?px\]/`;

const MOTION_IMPORT_RULE = {
  name: "motion/react",
  importNames: ["motion"],
  message: "Dùng `import * as m from \"motion/react-m\"` (LazyMotion strict) thay cho `motion.*`.",
};

const NEXT_LINK_RULE = {
  name: "next/link",
  message: "Dùng RouteLink (components/ui/route-link.tsx): tự chọn next/link cho path nội bộ, <a> cho link ngoài (mở tab mới).",
};

/* Ảnh raster nguồn phải là .webp — Next vẫn tự xuất AVIF/WebP khi phục vụ. */
const NON_WEBP_IMAGE_RULE = {
  group: ["**/*.jpg", "**/*.jpeg", "**/*.png", "**/*.gif", "**/*.bmp", "**/*.tif", "**/*.tiff"],
  message: "Ảnh nguồn phải ở dạng .webp chất lượng cao (xem AGENTS.md → Ảnh).",
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["app/**/*.tsx", "components/**/*.tsx"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: `Literal[value=${HEX_COLOR}], TemplateElement[value.raw=${HEX_COLOR}]`,
          message: "Không hard-code mã màu hex — dùng token (bg-primary-600, text-neutral-700…).",
        },
        {
          selector: `Literal[value=${ARBITRARY_PX}], TemplateElement[value.raw=${ARBITRARY_PX}]`,
          message: "Không dùng giá trị px tuỳ ý — dùng thang spacing/radius token.",
        },
        {
          selector: "JSXAttribute[name.name='style']",
          message: "Không dùng inline style — dùng class gắn token.",
        },
        {
          selector:
            "JSXOpeningElement[name.name='Image']:not(:has(JSXAttribute[name.name='quality'])):not(:has(JSXAttribute[name.name='unoptimized']))",
          message: "<Image> phải khai báo quality={IMAGE_QUALITY.standard | IMAGE_QUALITY.high} (lib/image.ts).",
        },
        {
          selector: "JSXAttribute[name.name='quality'] Literal",
          message: "Không ghi số quality trực tiếp — dùng IMAGE_QUALITY trong lib/image.ts.",
        },
      ],
      "@next/next/no-img-element": "error",
    },
  },
  {
    files: ["components/**/*.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [MOTION_IMPORT_RULE, NEXT_LINK_RULE],
          patterns: [
            NON_WEBP_IMAGE_RULE,
            {
              group: ["@/content", "@/content/**"],
              message: "Component chỉ chứa khung giao diện — nhận nội dung qua props, không import từ content/.",
              allowTypeImports: true,
            },
          ],
        },
      ],
    },
  },
  {
    files: ["components/**/*.tsx"],
    ignores: ["components/seo/**"],
    rules: {
      "react/jsx-no-literals": ["error", { noStrings: true, ignoreProps: true }],
    },
  },
  {
    files: ["app/**/*.{ts,tsx}", "content/**/*.ts", "hooks/**/*.ts", "lib/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [MOTION_IMPORT_RULE, NEXT_LINK_RULE],
          patterns: [NON_WEBP_IMAGE_RULE],
        },
      ],
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
