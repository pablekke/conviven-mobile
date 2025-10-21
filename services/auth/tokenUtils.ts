export function extractAccessToken(data: any): string | null {
  if (!data) {
    return null;
  }

  if (typeof data === "string") {
    return data;
  }

  if (typeof data !== "object") {
    return null;
  }

  const directToken =
    data.token ||
    data.accessToken ||
    data.access_token ||
    data.jwt ||
    data.idToken ||
    data.authToken;

  if (typeof directToken === "string") {
    return directToken;
  }

  const tokensContainer =
    data.tokens || data.tokenData || data.credentials || data.session || data.data?.tokens;

  if (tokensContainer) {
    const nestedToken = extractAccessToken(tokensContainer);
    if (nestedToken) {
      return nestedToken;
    }

    if (typeof tokensContainer === "object") {
      const accessToken =
        tokensContainer.accessToken ||
        tokensContainer.access_token ||
        tokensContainer.access?.token ||
        tokensContainer.access?.accessToken;

      if (typeof accessToken === "string") {
        return accessToken;
      }
    }
  }

  if (Array.isArray(data)) {
    for (const item of data) {
      const token = extractAccessToken(item);
      if (token) {
        return token;
      }
    }
  }

  if (data.data) {
    return extractAccessToken(data.data);
  }

  return null;
}

export function extractRefreshToken(data: any): string | null {
  if (!data || typeof data !== "object") {
    return null;
  }

  const directRefresh =
    data.refreshToken ||
    data.refresh_token ||
    data.refresh?.token ||
    data.tokens?.refreshToken ||
    data.data?.refreshToken;

  if (typeof directRefresh === "string") {
    return directRefresh;
  }

  if (Array.isArray(data)) {
    for (const item of data) {
      const token = extractRefreshToken(item);
      if (token) {
        return token;
      }
    }
  }

  if (data.data) {
    return extractRefreshToken(data.data);
  }

  return null;
}

