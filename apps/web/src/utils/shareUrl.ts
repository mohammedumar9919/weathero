/** Shareable dashboard URL: ?view=app&city=… (+ units only if present in current URL). */
export function buildShareWeatherUrl(
  city: string,
  search = "",
  origin = "http://localhost:5173",
  pathname = "/",
): string {
  const normalized = city.trim().replace(/\s+/g, " ");
  const url = new URL(pathname, origin);
  url.searchParams.set("view", "app");
  url.searchParams.set("city", normalized);

  const current = new URLSearchParams(search);
  const units = current.get("units");
  if (units) {
    url.searchParams.set("units", units);
  }

  return url.toString();
}

export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fallback below */
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}
