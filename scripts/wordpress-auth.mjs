import {
  buildRestRouteApiBase,
  buildWordPressRestUrl,
  normalizeWordPressApiBase,
} from "./wordpress-rest-url.mjs";

export function getWordPressScriptConfig({ allowDryRun = false } = {}) {
  const isDryRun = process.env.DRY_RUN === "true";
  const wordpressUrl =
    process.env.WORDPRESS_URL ||
    process.env.WORDPRESS_SITE_URL ||
    (allowDryRun && isDryRun ? "https://example.invalid" : "");
  const username =
    process.env.WORDPRESS_USERNAME || (allowDryRun && isDryRun ? "dry-run" : "");
  const appPassword =
    process.env.WORDPRESS_APP_PASSWORD ||
    (allowDryRun && isDryRun ? "dry-run" : "");

  if (!wordpressUrl || !username || !appPassword) {
    throw new Error(
      "Missing WORDPRESS_URL, WORDPRESS_USERNAME, or WORDPRESS_APP_PASSWORD."
    );
  }

  const apiBase = normalizeWordPressApiBase(
    process.env.WORDPRESS_API_BASE ||
      new URL(
        "wp-json/wp/v2/",
        wordpressUrl.endsWith("/") ? wordpressUrl : `${wordpressUrl}/`
      ).toString()
  );

  return {
    apiBase,
    fallbackApiBase: buildRestRouteApiBase(apiBase),
    authHeader: `Basic ${Buffer.from(`${username}:${appPassword}`).toString(
      "base64"
    )}`,
    forwardedHost: new URL(wordpressUrl).host,
    isDryRun,
    username,
    wordpressUrl,
  };
}

export function buildWordPressHeaders(config, extraHeaders = {}) {
  return {
    Authorization: config.authHeader,
    "X-Forwarded-Proto": "https",
    "X-Forwarded-Host": config.forwardedHost,
    ...extraHeaders,
  };
}

export function buildWordPressRequestUrl(config, endpoint) {
  return buildWordPressRestUrl(config.apiBase, endpoint);
}

export async function fetchWordPressRest(config, endpoint, options = {}) {
  const method = options.method || "GET";
  const body = options.body ? JSON.stringify(options.body) : undefined;
  const headers = buildWordPressHeaders(config, {
    ...(body ? { "Content-Type": "application/json" } : {}),
    ...(options.headers || {}),
  });
  let requestUrl = buildWordPressRestUrl(config.apiBase, endpoint);
  let response = await fetch(requestUrl, {
    method,
    headers,
    body,
  });
  let text = await response.text();

  if (!response.ok && response.status === 404 && config.fallbackApiBase) {
    requestUrl = buildWordPressRestUrl(config.fallbackApiBase, endpoint);
    response = await fetch(requestUrl, {
      method,
      headers,
      body,
    });
    text = await response.text();
  }

  return {
    ok: response.ok,
    status: response.status,
    text,
    url: requestUrl,
    json: () => (text ? JSON.parse(text) : null),
  };
}

export async function assertWordPressAuth(config) {
  const response = await fetchWordPressRest(config, "/users/me?context=edit");

  if (!response.ok) {
    throw new Error(
      `WordPress authentication failed at ${response.url} with ${response.status}: ${response.text.slice(
        0,
        700
      )}`
    );
  }

  return response.json();
}

export function assertWordPressCapabilities(user, requiredCapabilities) {
  const capabilities = user.capabilities || {};
  const missingCapabilities = requiredCapabilities.filter(
    (capability) => !capabilities[capability]
  );

  if (missingCapabilities.length) {
    throw new Error(
      `Authenticated WordPress user is missing required capabilities: ${missingCapabilities.join(
        ", "
      )}. Use an administrator account, or an account that can edit posts and manage categories/tags.`
    );
  }
}
