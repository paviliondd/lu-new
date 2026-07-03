export const wordpressApiBase = (
  process.env.WORDPRESS_API_BASE ||
  process.env.NEXT_PUBLIC_WORDPRESS_API_URL ||
  ""
).replace(/\/$/, "");

export function buildWordPressRestUrl(apiBase: string, endpoint: string) {
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const [routePath, queryString = ""] = normalizedEndpoint.split("?");
  const url = new URL(apiBase);
  const restRoute = url.searchParams.get("rest_route");

  if (!restRoute) {
    return `${apiBase}${normalizedEndpoint}`;
  }

  const baseRoute = restRoute.replace(/\/$/, "");
  url.searchParams.set("rest_route", `${baseRoute}${routePath}`);

  const endpointParams = new URLSearchParams(queryString);
  endpointParams.forEach((value, key) => {
    url.searchParams.append(key, value);
  });

  return url.toString();
}

export function buildRestRouteApiBase(apiBase: string) {
  const url = new URL(apiBase);
  const wpJsonIndex = url.pathname.indexOf("/wp-json");

  if (wpJsonIndex === -1) return null;

  const wordpressPath = url.pathname.slice(0, wpJsonIndex) || "/";
  const routeBase = url.pathname.slice(wpJsonIndex + "/wp-json".length) || "/wp/v2";

  url.pathname = wordpressPath.endsWith("/") ? wordpressPath : `${wordpressPath}/`;
  url.search = "";
  url.searchParams.set("rest_route", routeBase.replace(/\/$/, ""));

  return url.toString();
}

export async function fetchWordPressRest(endpoint: string, init?: RequestInit) {
  if (!wordpressApiBase) {
    throw new Error("WORDPRESS_API_BASE is not configured");
  }

  const primaryUrl = buildWordPressRestUrl(wordpressApiBase, endpoint);
  let response = await fetch(primaryUrl, init);

  if (!response.ok && response.status === 404) {
    const fallbackApiBase = buildRestRouteApiBase(wordpressApiBase);
    if (fallbackApiBase) {
      response = await fetch(buildWordPressRestUrl(fallbackApiBase, endpoint), init);
    }
  }

  return response;
}
