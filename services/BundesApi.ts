import { apiFetch } from '@/services/ApiClient';

async function request(endpoint: string, params: Record<string, string | number> = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    query.append(key, String(value));
  });
  const qs = query.toString();

  const response = await apiFetch(`${endpoint}${qs ? `?${qs}` : ''}`);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`BundDev API request failed: ${response.status} ${errorText}`);
  }

  return response.json();
}

export interface JobSearchParams {
  was?: string;
  wo?: string;
  umkreis?: number;
  arbeitszeit?: string[]; // e.g. ['vz', 'ho'] — joined with ';'
  size?: number;
  page?: number;
}

export async function searchJobs({
  was,
  wo,
  umkreis,
  arbeitszeit,
  size = 10,
  page = 1,
}: JobSearchParams = {}) {
  const params: Record<string, string | number> = { size, page };
  if (was) params.was = was;
  if (wo) params.wo = wo;
  if (umkreis) params.umkreis = umkreis;
  if (arbeitszeit?.length) params.arbeitszeit = arbeitszeit.join(';');
  return request('/jobs', params);
}

export async function fetchJobs(size: number = 10, page: number = 1) {
  return searchJobs({ size, page });
}

export async function fetchJobDetail(jobId: string) {
  return request(`/job/${jobId}`);
}
