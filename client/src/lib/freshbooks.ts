import { apiRequest } from "./queryClient";

export async function connectFreshbooks() {
  const res = await apiRequest("GET", "/api/freshbooks/connect");
  const { url } = await res.json();
  window.location.href = url;
}

export async function disconnectFreshbooks() {
  await apiRequest("POST", "/api/freshbooks/disconnect");
}

export async function syncFreshbooks() {
  await apiRequest("POST", "/api/freshbooks/sync");
}
