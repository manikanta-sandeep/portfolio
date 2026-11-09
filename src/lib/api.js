import { basename } from "./paths";

export const API_ROOT = `${basename === "/" ? "" : basename}/api`;

export class ApiError extends Error {
  constructor(status, body) {
    super(body?.error || `Request failed (${status}).`);
    this.status = status;
    this.fields = body?.fields || {};
    this.index = body?.index;
  }
}

// JSON by default; pass a FormData body for uploads. The X-Requested-With header is
// required by the API for every state-changing request.
export async function api(path, { method = "GET", body, signal } = {}) {
  const isForm = body instanceof FormData;
  let response;
  try {
    response = await fetch(`${API_ROOT}${path}`, {
      method,
      signal,
      credentials: "same-origin",
      headers: {
        "X-Requested-With": "portfolio",
        ...(body && !isForm ? { "Content-Type": "application/json" } : {})
      },
      body: body ? (isForm ? body : JSON.stringify(body)) : undefined
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw error;
    }
    throw new ApiError(0, { error: "Can't reach the server. Check your connection and try again." });
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(response.status, data);
  }
  return data;
}
