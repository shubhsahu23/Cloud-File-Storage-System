import axios from "axios";

const defaultApiUrl = "http://localhost:8000";
const rawApiUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? defaultApiUrl : "");

if (!rawApiUrl) {
  throw new Error("VITE_API_URL is required in production");
}

const apiUrl =
  import.meta.env.DEV || rawApiUrl.includes("localhost") || rawApiUrl.includes("127.0.0.1")
    ? rawApiUrl
    : rawApiUrl.replace(/^http:\/\//i, "https://");

const API = axios.create({
  baseURL: apiUrl
});

export default API;