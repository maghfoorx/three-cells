export function getCookieValue(cookieHeader: string | null, key: string) {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";");
  for (let cookie of cookies) {
    const [name, ...rest] = cookie.trim().split("=");
    if (name === key) {
      return decodeURIComponent(rest.join("="));
    }
  }

  return null;
}
