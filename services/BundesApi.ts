// Use the current bundesAPI base URL for all job search requests
const BASE_URL = 'https://jobsuche.api.bund.dev';

async function request(endpoint: string, params: Record<string, string | number> = {}) {
  const url = new URL(`${BASE_URL}${endpoint}`);

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, String(value));
  });

  // The jobsuche.api.bund.dev endpoint does not require special headers
  const response = await fetch(url.toString());

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`BundDev API request failed: ${response.status} ${errorText}`);
  }

  return response.json();
}

export async function fetchJobs(size: number = 10, page: number = 1) {
  return request('/jobs', { size, page });
}

export async function fetchJobDetail(jobId: string) {
  return request(`/jobs/${jobId}`);
}

export async function searchJobs(query: string, size: number = 10, page: number = 1) {
  return request('/jobs', { was: query, size, page });
}
