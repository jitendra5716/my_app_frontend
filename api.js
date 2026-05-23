import axios from "axios";

const API = axios.create({
  baseURL: "https://3ml6dqp77j.execute-api.ap-south-1.amazonaws.com"
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default API;
