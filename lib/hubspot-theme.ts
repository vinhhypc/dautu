/* HubSpot vẽ form trong iframe cùng origin, không nhận CSS của trang → dựng CSS theo token ds-one rồi chèn vào iframe. */
const TOKENS = [
  "--color-brand-primary",
  "--color-brand-primary-hover",
  "--color-text-primary",
  "--color-text-secondary",
  "--color-text-tertiary",
  "--color-text-inverse",
  "--color-text-link",
  "--color-background-base",
  "--color-border-default",
  "--color-border-focus",
  "--color-system-red-primary",
] as const;

type Token = (typeof TOKENS)[number];

export function readThemeTokens(styles: CSSStyleDeclaration): Record<Token, string> {
  return Object.fromEntries(TOKENS.map((name) => [name, styles.getPropertyValue(name).trim()])) as Record<Token, string>;
}

export function hubspotFormCss(tokens: Record<Token, string>, fontFamily: string): string {
  const t = (name: Token) => tokens[name];
  return `
    html, body, .hs-form, .hs-form * { font-family: ${fontFamily} !important; }
    body { margin: 0; background: transparent; }
    .hs-form fieldset { max-width: none !important; }
    .hs-form .hs-form-field { margin-bottom: 16px !important; }
    .hs-form label:not(.hs-form-checkbox-display):not(.hs-form-radio-display) {
      display: block; margin-bottom: 8px !important; font-size: 14px !important; line-height: 20px !important;
      font-weight: 500 !important; color: ${t("--color-text-primary")} !important;
    }
    .hs-form .hs-form-required { color: ${t("--color-system-red-primary")} !important; }
    .hs-form legend, .hs-form .hs-field-desc { font-size: 14px !important; color: ${t("--color-text-tertiary")} !important; }
    .hs-form .hs-input:not([type=checkbox]):not([type=radio]) {
      box-sizing: border-box; width: 100% !important; min-height: 44px; padding: 10px 12px !important;
      font-size: 16px !important; line-height: 24px !important; color: ${t("--color-text-primary")} !important;
      background: ${t("--color-background-base")} !important; border: 1px solid ${t("--color-border-default")} !important;
      border-radius: 8px !important; box-shadow: none !important; outline: none !important;
    }
    .hs-form textarea.hs-input { min-height: 96px; }
    .hs-form .hs-input:focus { border-color: ${t("--color-border-focus")} !important; box-shadow: 0 0 0 1px ${t("--color-border-focus")} !important; }
    .hs-form .hs-input.invalid.error { border-color: ${t("--color-system-red-primary")} !important; }
    .hs-form .hs-input::placeholder { color: ${t("--color-text-tertiary")} !important; }
    .hs-form .inputs-list { padding: 0 !important; margin: 0 !important; list-style: none; }
    .hs-form .inputs-list label { display: flex !important; align-items: center; gap: 8px; min-height: 32px; font-size: 16px !important; color: ${t("--color-text-secondary")} !important; }
    .hs-form input[type=checkbox], .hs-form input[type=radio] { width: 18px; height: 18px; margin: 0 !important; accent-color: ${t("--color-brand-primary")}; }
    .hs-form .hs-error-msgs { padding: 0 !important; margin: 4px 0 0 !important; list-style: none; }
    .hs-form .hs-error-msg, .hs-form .hs-main-font-element { font-size: 14px !important; color: ${t("--color-system-red-primary")} !important; }
    .hs-form .hs_submit, .hs-form .actions { text-align: center; margin: 8px 0 0 !important; padding: 0 !important; }
    .hs-form .hs-button {
      min-height: 44px; padding: 10px 24px !important; font-size: 16px !important; line-height: 24px !important; font-weight: 600 !important;
      color: ${t("--color-text-inverse")} !important; background: ${t("--color-brand-primary")} !important;
      border: 0 !important; border-radius: 8px !important; box-shadow: none !important; cursor: pointer; transition: background-color 200ms;
    }
    .hs-form .hs-button:hover, .hs-form .hs-button:focus-visible { background: ${t("--color-brand-primary-hover")} !important; }
    .hs-form .hs-button:focus-visible { outline: 2px solid ${t("--color-border-focus")}; outline-offset: 2px; }
    .hs-form .hs-richtext, .hs-form .hs-richtext p { font-size: 14px !important; color: ${t("--color-text-secondary")} !important; }
    .hs-form a { color: ${t("--color-text-link")} !important; }
    .submitted-message { font-size: 16px; color: ${t("--color-text-primary")}; text-align: center; }
  `;
}
