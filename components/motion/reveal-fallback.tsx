const NO_JS_REVEAL_CSS =
  "[data-reveal]{opacity:1!important;transform:none!important}[data-sweep],[data-sweep-fade]{opacity:1!important}";

export function RevealFallback() {
  return (
    <noscript>
      <style>{NO_JS_REVEAL_CSS}</style>
    </noscript>
  );
}
