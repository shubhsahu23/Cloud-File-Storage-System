import axios from "axios";

const defaultApiUrl = "http://cloud-backend.ap-south-1.elasticbeanstalk.com/";
const rawApiUrl = import.meta.env.VITE_API_URL || defaultApiUrl;

const apiUrl =
  import.meta.env.DEV || rawApiUrl.includes("localhost") || rawApiUrl.includes("127.0.0.1")
    ? rawApiUrl
    : rawApiUrl.replace(/^http:\/\//i, "https://");

const API = axios.create({
  baseURL: apiUrl
});

export default API;