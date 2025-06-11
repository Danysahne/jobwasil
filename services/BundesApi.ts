// NEUE BASIS: Dein lokaler Proxy-Endpunkt
const BASE_URL = 'http://192.168.2.100:3000/api';
  // hier deine lokale Mac-IP einsetzen!

async function request(endpoint: string, params: Record<string, string | number> = {}) {
  const url = new URL(`${BASE_URL}${endpoint}`);

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, String(value));
  });

  // KEIN Header mehr nötig, Proxy kümmert sich darum
  const response = await fetch(url.toString());

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed: ${response.status} ${errorText}`);
  }

  return response.json();
}

export async function fetchJobs(size: number = 10, page: number = 1) {
  return request('/jobs', { size, page });
}

export async function fetchJobDetail(jobId: string) {
  return request(`/job/${jobId}`);
}
