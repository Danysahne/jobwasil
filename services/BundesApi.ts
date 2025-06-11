const BASE_URL = 'https://rest.arbeitsagentur.de/jobboerse/jobsuche-service/pc/v4';

async function request(endpoint: string, params: Record<string, string | number> = {}) {
  const url = new URL(`${BASE_URL}${endpoint}`);

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, String(value));
  });

  const response = await fetch(url.toString(), {
    headers: {
      'X-API-Key': 'jobboerse-jobsuche',
      'Accept': 'application/json',
    },
  });

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
  return request(`/jobs/${jobId}`);
}
