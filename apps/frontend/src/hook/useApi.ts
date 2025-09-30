import type { ApiConfig, ApiError } from "../types/api";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "");

const buildUrl = (
  endpoint: string,
  queryParams?: Record<string, string | number | boolean>
) => {
  if (!queryParams) return endpoint;
  const params = new URLSearchParams();
  Object.entries(queryParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, String(value));
    }
  });
  return `${endpoint}?${params.toString()}`;
};

export const fetchApi = async <TResponse, TPayload = undefined>(
  config: ApiConfig<TResponse, TPayload>
): Promise<TResponse> => {
  const {
    endpoint,
    method = "GET",
    headers = {},
    payload,
    queryParams,
    responseSchema,
    payloadSchema,
  } = config;

  // Validate payload before sending (if schema provided)
  if (payload && payloadSchema) {
    payloadSchema.parse(payload);
  }

  if (!API_BASE_URL) {
    throw new Error(
      "API_BASE_URL is not defined. Check your .env and Vite config."
    );
  }

  const normalizedEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;
  const url = buildUrl(`${API_BASE_URL}${normalizedEndpoint}`, queryParams);
  console.log("url", url);

  const isFormData = payload instanceof FormData;

  const finalHeaders = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...headers,
  };

  const response = await fetch(url, {
    method,
    headers: finalHeaders,
    body: isFormData ? payload : payload ? JSON.stringify(payload) : undefined,
    credentials: "include",
  });

  if (!response.ok) {
    const error: ApiError = {
      message: `Request failed with status ${response.status}`,
      status: response.status,
    };

    try {
      error.details = await response.json();
    } catch {
      console.error("Failed to parse error response as JSON");
    }
    throw error;
  }

  const data = await response.json();

  if (responseSchema) {
    return responseSchema.parse(data);
  }
  return data;
};
// hooks/useApi.ts
import {
  useQuery,
  useMutation,
  type UseQueryOptions,
  type UseMutationOptions,
} from "@tanstack/react-query";

// For GET
export const useApi = <TResponse, TPayload = undefined>(
  config: ApiConfig<TResponse, TPayload>,
  options?: Omit<UseQueryOptions<TResponse, ApiError>, "queryKey" | "queryFn">
) => {
  const queryKey = [
    config.endpoint,
    config.method,
    config.queryParams,
    config.payload,
  ];
  return useQuery<TResponse, ApiError>({
    queryKey,
    queryFn: () => fetchApi<TResponse, TPayload>(config),
    ...options,
  });
};

// For POST/PUT/PATCH/DELETE
export const useApiMutation = <TResponse, TPayload = undefined>(
  config: Omit<ApiConfig<TResponse, TPayload>, "payload">,
  options?: UseMutationOptions<TResponse, ApiError, TPayload>
) => {
  return useMutation<TResponse, ApiError, TPayload>({
    mutationFn: (payload: TPayload) =>
      fetchApi<TResponse, TPayload>({ ...config, payload }),
    ...options,
  });
};
