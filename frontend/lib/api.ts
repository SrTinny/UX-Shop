import axios from "axios";
import { getToken, clearToken } from "./auth";

/** normaliza e evita // no baseURL */
function normalizeBaseURL(url?: string | null) {
  const raw = (url ?? "").trim();
  if (!raw) {
    // Fallback sensato p/ desenvolvimento local
    if (typeof window !== "undefined" && window.location.hostname === "localhost") {
      return "http://localhost:3001";
    }
    // Último recurso: usa a própria origem (útil se um dia fizer proxy)
    return window?.location?.origin ?? "";
  }
  return raw.replace(/\/+$/, ""); // remove barras à direita
}

const BASE_URL = normalizeBaseURL(process.env.NEXT_PUBLIC_API_URL);

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  // withCredentials: true, // habilite se um dia trocar JWT por cookies
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // expulsa em 401
    if (err?.response?.status === 401) {
      clearToken();
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);
