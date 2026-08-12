// Client-side cookie utilities
export function getCookie(name: string): string | null {
  if (typeof window === "undefined") return null;
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

export function setCookie(name: string, value: string, minutes: number = 60) {
  if (typeof window === "undefined") return;
  let expires = "";
  if (minutes) {
    const date = new Date();
    date.setTime(date.getTime() + minutes * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = `${name}=${value}${expires}; path=/; SameSite=Lax;`;
}

export function deleteCookie(name: string) {
  if (typeof window === "undefined") return;
  document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax;`;
}

// Interface for claims decoded from JWT
export interface DecodedToken {
  nameid: string; // User ID
  email: string;
  unique_name: string; // Full name
  role: string; // "Admin", "Teacher", "Student"
  exp: number;
}

// Decode JWT token client-side without external dependencies
export function decodeJwt(token: string): DecodedToken | null {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    // ASP.NET Core claims may be mapped to standard JWT names
    const parsed = JSON.parse(jsonPayload);
    
    // Support both standard JWT claim names and XML namespaces from Microsoft JWT handler
    return {
      nameid: parsed.nameid || parsed["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"],
      email: parsed.email || parsed["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"],
      unique_name: parsed.unique_name || parsed["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"],
      role: parsed.role || parsed["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"],
      exp: parsed.exp
    };
  } catch (error) {
    console.error("Failed to decode JWT token", error);
    return null;
  }
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

// Custom API Client using native fetch
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getCookie("auth_token");
  
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // If the body is FormData (for submission uploads), do NOT manually set the Content-Type header.
  // The browser will automatically set it along with the boundary string.
  const isMultipart = options.body instanceof FormData;
  
  if (!isMultipart && !headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;
  try {
    response = await fetch(endpoint, {
      ...options,
      headers,
    });
  } catch (error) {
    throw new ApiError("Failed to connect to the server. Please verify the backend is running.", 0);
  }

  if (response.status === 401 && !endpoint.includes("/api/auth/refresh") && !endpoint.includes("/api/auth/login")) {
    const refreshToken = getCookie("refresh_token");
    if (refreshToken && token) {
      try {
        const refreshResponse = await fetch("/api/auth/refresh", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: token,
            refreshToken: refreshToken
          })
        });

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          setCookie("auth_token", data.token, 60);
          setCookie("refresh_token", data.refreshToken, 7 * 24 * 60);

          headers.set("Authorization", `Bearer ${data.token}`);
          try {
            response = await fetch(endpoint, {
              ...options,
              headers,
            });
          } catch (retryError) {
            throw new ApiError("Failed to connect to the server. Please verify the backend is running.", 0);
          }
        } else {
          deleteCookie("auth_token");
          deleteCookie("refresh_token");
        }
      } catch (error) {
        console.error("Token refresh failed", error);
      }
    }
  }

  if (!response.ok) {
    let errorMessage = "An unexpected error occurred.";
    try {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        if (errorData.errors) {
          errorMessage = Object.values(errorData.errors)
            .flat()
            .join(" ");
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else {
          errorMessage = errorData.title || JSON.stringify(errorData);
        }
      } else {
        const text = await response.text();
        if (text) {
          if (text.trim().startsWith("<!") || text.includes("<html") || (contentType && contentType.includes("text/html"))) {
            if (response.status === 502) {
              errorMessage = "Unable to connect to the backend server (502 Bad Gateway). Please make sure the backend is running.";
            } else if (response.status === 503) {
              errorMessage = "Backend service is temporarily unavailable (503 Service Unavailable).";
            } else if (response.status === 504) {
              errorMessage = "Backend server took too long to respond (504 Gateway Timeout).";
            } else {
              errorMessage = `Server error (${response.status}). Please check if the backend is running.`;
            }
          } else {
            errorMessage = text;
          }
        }
      }
    } catch {
      // Fallback to default
    }
    
    throw new ApiError(errorMessage || response.statusText, response.status);
  }

  const text = await response.text();
  if (!text) {
    return {} as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}
