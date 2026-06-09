export function normalizeWordPressApiBase(apiBase) {
  return apiBase.replace(/\/$/, "");
}

export function buildWordPressRestUrl(apiBase, endpoint) {
  const normalizedBase = normalizeWordPressApiBase(apiBase);
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const [routePath, queryString = ""] = normalizedEndpoint.split("?");
  const url = new URL(normalizedBase);
  const restRoute = url.searchParams.get("rest_route");

  if (!restRoute) {
    return `${normalizedBase}${normalizedEndpoint}`;
  }

  const baseRoute = restRoute.replace(/\/$/, "");
  url.searchParams.set("rest_route", `${baseRoute}${routePath}`);

  const endpointParams = new URLSearchParams(queryString);
  endpointParams.forEach((value, key) => {
    url.searchParams.append(key, value);
  });

  return url.toString();
}

export function buildRestRouteApiBase(apiBase) {
  const url = new URL(normalizeWordPressApiBase(apiBase));
  const wpJsonIndex = url.pathname.indexOf("/wp-json");

  if (wpJsonIndex === -1) return null;

  const wordpressPath = url.pathname.slice(0, wpJsonIndex) || "/";
  const routeBase = url.pathname.slice(wpJsonIndex + "/wp-json".length) || "/wp/v2";

  url.pathname = wordpressPath.endsWith("/") ? wordpressPath : `${wordpressPath}/`;
  url.search = "";
  url.searchParams.set("rest_route", routeBase.replace(/\/$/, ""));

  return url.toString();
}
