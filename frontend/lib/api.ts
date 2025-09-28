// frontend/lib/api.ts
import axios, { AxiosError } from "axios";
import { getToken, clearToken } from "./auth";
import type { AxiosRequestConfig } from "axios";

interface RetryableAxiosRequestConfig extends AxiosRequestConfig {
  _retryCount?: number;
}

/** Normaliza URL e remove barras finais; sem tocar em window no build */
function normalizeBaseURL(url?: string | null) {
  const raw = (url ?? "").trim();
  if (!raw) return undefined;           // undefined => Axios usa a origem no browser
  return raw.replace(/\/+$/, "");       // remove barras à direita
}

const BASE_URL = normalizeBaseURL(process.env.NEXT_PUBLIC_API_URL);

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 45000, // ↑ tolera cold start do Render (pode deixar 60_000 se quiser)
});

// ===== Auth header =====
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ===== Retry simples para timeout/network errors =====
const MAX_RETRIES = 3;
api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    // Se 401: limpar token e mandar para login
    if (error.response?.status === 401) {
      clearToken();
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }

    const cfg: RetryableAxiosRequestConfig = (error.config ?? {}) as RetryableAxiosRequestConfig;
    const isTimeout = error.code === "ECONNABORTED";   // timeout do axios
    const noResponse = !error.response;               // DNS, rede, CORS, etc.
    const status = error.response?.status;
    const shouldRetryStatus = typeof status === "number" && (status >= 500 || status === 429); // 5xx ou 429

    if ((isTimeout || noResponse || shouldRetryStatus) && (cfg._retryCount ?? 0) < MAX_RETRIES) {
      cfg._retryCount = (cfg._retryCount ?? 0) + 1;

      // backoff exponencial: 400ms, 800ms, 1600ms...
      const delay = 400 * 2 ** (cfg._retryCount - 1);
      await new Promise((r) => setTimeout(r, delay));

      return api(cfg);
    }

    return Promise.reject(error);
  },
);
