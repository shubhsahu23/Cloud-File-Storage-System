import axios from "axios";

const defaultApiUrl = "http://localhost:8000/"; // Fallback URL for development

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || defaultApiUrl
});

export default API;