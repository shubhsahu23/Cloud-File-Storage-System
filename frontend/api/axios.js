import axios from "axios";

const defaultApiUrl = "http://cloud-backend.ap-south-1.elasticbeanstalk.com/"; // Fallback URL for development

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || defaultApiUrl
});

export default API;