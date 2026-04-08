/**
 * Safe string for on-page error UI (avoids `||` in template literals — some devtools hooks mis-parse that).
 */
export function showCaughtError(err) {
  let text;
  if (err instanceof Error && typeof err.stack === "string" && err.stack.length > 0) {
    text = err.stack;
  } else {
    text = String(err);
  }
  document.body.innerHTML = `<pre style="color:#f88;padding:16px;white-space:pre-wrap;font:14px/1.4 system-ui;background:#111">${text}</pre>`;
}
