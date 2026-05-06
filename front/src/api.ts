import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
});

export async function getUrls(filter: Record<string, any>) {
  return api.get("/all/sher/urls", {
    params: filter,
  });
}

export async function addUrl(code: string, url: string) {
  return api.post("/", {
    code,
    url,
  });
}

export async function removeUrl(code: string) {
  return api.delete(`/${code}`);
}
