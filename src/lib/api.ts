import { useAppStore } from "@/store/useAppStore";

export interface ApiRequestOptions extends RequestInit {
  path: string;
}

export async function apiRequest<T = any>({ path, method = "GET", headers, body, ...rest }: ApiRequestOptions): Promise<T> {
  const { backendBaseUrl, apiKey, defaultHeaders } = useAppStore.getState();

  const url = `${backendBaseUrl.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;

  const finalHeaders: HeadersInit = {
    "Content-Type": body ? "application/json" : "application/json",
    ...defaultHeaders,
    ...(apiKey ? { Authorization: apiKey } : {}),
    ...(headers ?? {}),
  };

  const response = await fetch(url, {
    method,
    headers: finalHeaders,
    body: typeof body === "string" ? body : body ? JSON.stringify(body) : undefined,
    ...rest,
  });

  const text = await response.text();
  const data = text ? (JSON.parse(text) as T) : (undefined as unknown as T);

  if (!response.ok) {
    const error: any = new Error((data as any)?.message || "Request failed");
    error.status = response.status;
    error.body = data;
    throw error;
  }

  return data;
}
