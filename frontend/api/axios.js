import axios from "axios";

const defaultApiUrl = "http://localhost:8000";
const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? defaultApiUrl : "");

if (!apiUrl) {
  throw new Error("VITE_API_URL is required in production");
}

const API = axios.create({
  baseURL: apiUrl
});

export default API;